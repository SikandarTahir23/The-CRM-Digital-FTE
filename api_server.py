# -*- coding: utf-8 -*-
"""
Customer Success Digital FTE - Complete API

Endpoints for:
- Tickets (list, get, update)
- Customers (list, get, history)
- Reports (analytics, metrics)
- Health & Status
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ['PYTHONIOENCODING'] = 'utf-8'
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from datetime import datetime, date, timedelta
from decimal import Decimal
from uuid import UUID
from production.config import settings
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="Customer Success API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


def get_db_conn():
    return psycopg2.connect(settings.DATABASE_URL, sslmode='require')


@contextmanager
def db_cursor():
    conn = get_db_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            yield cur, conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def serialize_row(row):
    """Convert a RealDictRow to JSON-safe dict."""
    d = dict(row)
    for k, v in d.items():
        if isinstance(v, (datetime, date)):
            d[k] = v.isoformat()
        elif isinstance(v, Decimal):
            d[k] = float(v)
        elif isinstance(v, UUID):
            d[k] = str(v)
    return d


# =============================================================================
# Models
# =============================================================================

class TicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[str] = None


# =============================================================================
# Tickets Endpoints
# =============================================================================

@app.get("/api/v1/tickets")
async def get_tickets(
    status: Optional[str] = None,
    channel: Optional[str] = None,
    priority: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Get all tickets with filtering and pagination"""
    try:
        with db_cursor() as (cur, conn):
            conditions = []
            params = []

            if status:
                conditions.append("status = %s")
                params.append(status)
            if channel:
                conditions.append("channel = %s")
                params.append(channel)
            if priority:
                conditions.append("priority = %s")
                params.append(priority)

            where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""

            cur.execute(f"SELECT COUNT(*) FROM tickets{where_clause}", params)
            total = cur.fetchone()['count']

            offset = (page - 1) * limit
            cur.execute(f"""
                SELECT t.*, c.name as customer_name, c.email as customer_email
                FROM tickets t
                LEFT JOIN customers c ON c.id = t.customer_id
                {where_clause}
                ORDER BY t.created_at DESC
                LIMIT %s OFFSET %s
            """, params + [limit, offset])

            tickets = [serialize_row(row) for row in cur.fetchall()]

        return {
            "tickets": tickets,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit
            }
        }
    except Exception as e:
        logger.error(f"Error getting tickets: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/tickets/{ticket_id}")
async def get_ticket(ticket_id: str):
    """Get single ticket with details"""
    try:
        with db_cursor() as (cur, conn):
            cur.execute("""
                SELECT t.*, c.name as customer_name, c.email as customer_email,
                       c.phone_number, c.total_tickets, c.average_sentiment
                FROM tickets t
                LEFT JOIN customers c ON c.id = t.customer_id
                WHERE t.id = %s
            """, (ticket_id,))

            ticket = cur.fetchone()

            if not ticket:
                raise HTTPException(status_code=404, detail="Ticket not found")

            cur.execute("""
                SELECT * FROM messages
                WHERE ticket_id = %s
                ORDER BY sent_at ASC
            """, (ticket_id,))
            messages = [serialize_row(row) for row in cur.fetchall()]

        return {
            "ticket": serialize_row(ticket),
            "messages": messages
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting ticket: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.patch("/api/v1/tickets/{ticket_id}")
async def update_ticket(ticket_id: str, update: TicketUpdate):
    """Update ticket status, priority, or assignment"""
    try:
        with db_cursor() as (cur, conn):
            updates = []
            params = []

            if update.status:
                updates.append("status = %s")
                params.append(update.status)
            if update.priority:
                updates.append("priority = %s")
                params.append(update.priority)
            if update.assigned_to:
                updates.append("assigned_to = %s")
                params.append(update.assigned_to)

            if updates:
                params.append(ticket_id)
                cur.execute(f"""
                    UPDATE tickets
                    SET {', '.join(updates)}, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                    RETURNING *
                """, params)
                ticket = cur.fetchone()
            else:
                cur.execute("SELECT * FROM tickets WHERE id = %s", (ticket_id,))
                ticket = cur.fetchone()

        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")

        return {"ticket": serialize_row(ticket), "message": "Ticket updated"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating ticket: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# Customers Endpoints
# =============================================================================

@app.get("/api/v1/customers")
async def get_customers(
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Get all customers with search and pagination"""
    try:
        with db_cursor() as (cur, conn):
            if search:
                cur.execute("""
                    SELECT COUNT(*) FROM customers
                    WHERE email ILIKE %s OR name ILIKE %s
                """, (f"%{search}%", f"%{search}%"))
            else:
                cur.execute("SELECT COUNT(*) FROM customers")

            total = cur.fetchone()['count']

            if search:
                cur.execute("""
                    SELECT * FROM customers
                    WHERE email ILIKE %s OR name ILIKE %s
                    ORDER BY created_at DESC
                    LIMIT %s OFFSET %s
                """, (f"%{search}%", f"%{search}%", limit, (page - 1) * limit))
            else:
                cur.execute("""
                    SELECT * FROM customers
                    ORDER BY created_at DESC
                    LIMIT %s OFFSET %s
                """, (limit, (page - 1) * limit))

            customers = [serialize_row(row) for row in cur.fetchall()]

        return {
            "customers": customers,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit
            }
        }
    except Exception as e:
        logger.error(f"Error getting customers: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/customers/{customer_id}")
async def get_customer(customer_id: str):
    """Get customer with full history"""
    try:
        with db_cursor() as (cur, conn):
            cur.execute("SELECT * FROM customers WHERE id = %s", (customer_id,))
            customer = cur.fetchone()

            if not customer:
                raise HTTPException(status_code=404, detail="Customer not found")

            cur.execute("""
                SELECT * FROM tickets
                WHERE customer_id = %s
                ORDER BY created_at DESC
                LIMIT 10
            """, (customer_id,))
            tickets = [serialize_row(row) for row in cur.fetchall()]

            cur.execute("""
                SELECT * FROM conversations
                WHERE customer_id = %s
                ORDER BY opened_at DESC
                LIMIT 10
            """, (customer_id,))
            conversations = [serialize_row(row) for row in cur.fetchall()]

        return {
            "customer": serialize_row(customer),
            "tickets": tickets,
            "conversations": conversations
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting customer: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# Reports & Analytics Endpoints
# =============================================================================

@app.get("/api/v1/reports/overview")
async def get_overview():
    """Get overview statistics"""
    try:
        with db_cursor() as (cur, conn):
            cur.execute("SELECT COUNT(*) FROM tickets")
            total_tickets = cur.fetchone()['count']

            cur.execute("SELECT COUNT(*) FROM tickets WHERE status = 'open'")
            open_tickets = cur.fetchone()['count']

            cur.execute("SELECT COUNT(*) FROM tickets WHERE status = 'resolved'")
            resolved_tickets = cur.fetchone()['count']

            cur.execute("SELECT COUNT(*) FROM tickets WHERE status = 'escalated'")
            escalated_tickets = cur.fetchone()['count']

            cur.execute("SELECT COUNT(*) FROM customers")
            total_customers = cur.fetchone()['count']

            cur.execute("""
                SELECT channel, COUNT(*) as count
                FROM tickets
                GROUP BY channel
            """)
            by_channel = {row['channel']: row['count'] for row in cur.fetchall()}

            cur.execute("""
                SELECT status, COUNT(*) as count
                FROM tickets
                GROUP BY status
            """)
            by_status = {row['status']: row['count'] for row in cur.fetchall()}

        return {
            "total_tickets": total_tickets,
            "open_tickets": open_tickets,
            "resolved_tickets": resolved_tickets,
            "escalated_tickets": escalated_tickets,
            "total_customers": total_customers,
            "by_channel": by_channel,
            "by_status": by_status
        }
    except Exception as e:
        logger.error(f"Error getting overview: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/reports/trends")
async def get_trends(days: int = Query(7, ge=1, le=30)):
    """Get ticket trends for last N days"""
    try:
        with db_cursor() as (cur, conn):
            cur.execute("""
                SELECT DATE(created_at) as date, COUNT(*) as count,
                    COUNT(*) FILTER (WHERE status='resolved')  as resolved,
                    COUNT(*) FILTER (WHERE status='escalated') as escalated
                FROM tickets
                WHERE created_at >= NOW() - make_interval(days => %s)
                GROUP BY DATE(created_at) ORDER BY date ASC
            """, (days,))
            trends = [serialize_row(r) for r in cur.fetchall()]
        return {"trends": trends, "days": days}
    except Exception as e:
        logger.error(f"Error getting trends: {e}")
        return {"trends": [], "days": days}


@app.get("/api/v1/reports/sentiment")
async def get_sentiment():
    """Get sentiment analysis stats"""
    try:
        with db_cursor() as (cur, conn):
            cur.execute("""
                SELECT COUNT(*) as total,
                    COALESCE(AVG(sentiment_score),0) as avg_score,
                    COUNT(*) FILTER (WHERE sentiment_score < 0.3)  as negative,
                    COUNT(*) FILTER (WHERE sentiment_score BETWEEN 0.3 AND 0.7) as neutral,
                    COUNT(*) FILTER (WHERE sentiment_score > 0.7)  as positive
                FROM ai_interactions
            """)
            s = cur.fetchone()
        return {"total": s['total'], "average_score": float(s['avg_score']),
                "negative": s['negative'], "neutral": s['neutral'], "positive": s['positive']}
    except Exception as e:
        logger.error(f"Error getting sentiment: {e}")
        return {"total": 0, "average_score": 0, "negative": 0, "neutral": 0, "positive": 0}


# =============================================================================
# Health & Status
# =============================================================================

@app.get("/api/v1/health")
async def health_check():
    """Health check"""
    try:
        with db_cursor() as (cur, conn):
            cur.execute("SELECT 1")
            cur.fetchone()

        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }


if __name__ == "__main__":
    import uvicorn
    
    logger.info("=" * 60)
    logger.info("CUSTOMER SUCCESS API v1.0.0")
    logger.info("=" * 60)
    logger.info("Running on http://localhost:8002")
    logger.info("=" * 60)
    
    uvicorn.run(app, host="0.0.0.0", port=8002, workers=1)
