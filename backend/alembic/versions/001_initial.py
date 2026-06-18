'''Initial migration

Revision ID: 001_initial
Revises: 
Create Date: 2026-06-17

'''
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('users', sa.Column('id', postgresql.UUID(as_uuid = True), nullable = False), sa.Column('name', sa.String(length = 255), nullable = False), sa.Column('email', sa.String(length = 255), nullable = False), sa.Column('google_id', sa.String(length = 255), nullable = False), sa.Column('role', sa.Enum('REQUESTER', 'REVIEWER', name = 'user_role_enum', inherit_schema = True), nullable = False), sa.Column('created_at', sa.DateTime(timezone = True), server_default = sa.text('now()'), nullable = False), sa.PrimaryKeyConstraint('id'))
    op.create_index(op.f('ix_users_email'), 'users', [
        'email'], unique = True)
    op.create_index(op.f('ix_users_google_id'), 'users', [
        'google_id'], unique = True)
    op.create_index(op.f('ix_users_id'), 'users', [
        'id'], unique = False)
    op.create_table('approval_requests', sa.Column('id', postgresql.UUID(as_uuid = True), nullable = False), sa.Column('title', sa.String(length = 255), nullable = False), sa.Column('description', sa.Text(), nullable = False), sa.Column('priority', sa.Enum('LOW', 'MEDIUM', 'HIGH', name = 'request_priority_enum', inherit_schema = True), nullable = False), sa.Column('status', sa.Enum('PENDING', 'APPROVED', 'REJECTED', name = 'request_status_enum', inherit_schema = True), nullable = False), sa.Column('created_by', postgresql.UUID(as_uuid = True), nullable = False), sa.Column('reviewer_id', postgresql.UUID(as_uuid = True), nullable = True), sa.Column('created_at', sa.DateTime(timezone = True), server_default = sa.text('now()'), nullable = False), sa.Column('updated_at', sa.DateTime(timezone = True), server_default = sa.text('now()'), nullable = False), sa.ForeignKeyConstraint([
        'created_by'], [
        'users.id'], ondelete = 'CASCADE'), sa.ForeignKeyConstraint([
        'reviewer_id'], [
        'users.id'], ondelete = 'SET NULL'), sa.PrimaryKeyConstraint('id'))
    op.create_index(op.f('ix_approval_requests_created_by'), 'approval_requests', [
        'created_by'], unique = False)
    op.create_index(op.f('ix_approval_requests_reviewer_id'), 'approval_requests', [
        'reviewer_id'], unique = False)
    op.create_index(op.f('ix_approval_requests_status'), 'approval_requests', [
        'status'], unique = False)
    op.create_index(op.f('ix_approval_requests_title'), 'approval_requests', [
        'title'], unique = False)
    op.create_index(op.f('ix_approval_requests_id'), 'approval_requests', [
        'id'], unique = False)
    op.create_table('review_actions', sa.Column('id', postgresql.UUID(as_uuid = True), nullable = False), sa.Column('request_id', postgresql.UUID(as_uuid = True), nullable = False), sa.Column('action', sa.Enum('APPROVED', 'REJECTED', name = 'review_action_type_enum', inherit_schema = True), nullable = False), sa.Column('comments', sa.Text(), nullable = True), sa.Column('reviewed_by', postgresql.UUID(as_uuid = True), nullable = False), sa.Column('reviewed_at', sa.DateTime(timezone = True), server_default = sa.text('now()'), nullable = False), sa.ForeignKeyConstraint([
        'request_id'], [
        'approval_requests.id'], ondelete = 'CASCADE'), sa.ForeignKeyConstraint([
        'reviewed_by'], [
        'users.id'], ondelete = 'CASCADE'), sa.PrimaryKeyConstraint('id'))
    op.create_index(op.f('ix_review_actions_request_id'), 'review_actions', [
        'request_id'], unique = False)
    op.create_index(op.f('ix_review_actions_reviewed_by'), 'review_actions', [
        'reviewed_by'], unique = False)
    op.create_index(op.f('ix_review_actions_id'), 'review_actions', [
        'id'], unique = False)


def downgrade():
    op.drop_table('review_actions')
    op.drop_table('approval_requests')
    op.drop_table('users')
