#!/usr/bin/env python3
"""
Hermes Agent Sync Bridge for Siam's System Management
Direct local database integration & task bidirectional sync
"""

import sys
import json
import urllib.request
import urllib.parse

BASE_URL = "http://localhost:3001/api/agent/sync"

def get_sync_data():
    try:
        req = urllib.request.Request(BASE_URL)
        with urllib.request.urlopen(req, timeout=5) as res:
            return json.loads(res.read().decode('utf-8'))
    except Exception as e:
        print(f"Error connecting to Siam Management System at {BASE_URL}: {e}")
        return None

def post_action(action, payload):
    try:
        data = json.dumps({"action": action, "payload": payload}).encode('utf-8')
        req = urllib.request.Request(BASE_URL, data=data, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=5) as res:
            return json.loads(res.read().decode('utf-8'))
    except Exception as e:
        print(f"Error performing action {action}: {e}")
        return None

def list_tasks():
    data = get_sync_data()
    if not data or not data.get("success"):
        return
    tasks = data.get("tasks", [])
    print(f"\n=== SIAM MANAGEMENT SYSTEM - TASKS ({len(tasks)} Total) ===")
    for t in tasks:
        status_icon = "✓" if t['status'] == "DONE" else ("▶" if t['status'] == "IN_PROGRESS" else "○")
        print(f"[{status_icon}] [{t['priority']:6}] {t['title']} (ID: {t['id']})")
        if t.get('description'):
            print(f"     Details: {t['description']}")
    print()

def add_task(title, description="", priority="MEDIUM", tags=None):
    if tags is None:
        tags = ["Hermes-Synced"]
    payload = {
        "title": title,
        "description": description,
        "priority": priority,
        "tags": tags,
        "status": "PENDING"
    }
    res = post_action("create_task", payload)
    if res and res.get("success"):
        print(f"✓ Task successfully added to Siam Management System: '{title}'")
    else:
        print("Failed to add task:", res)

def complete_task(task_id):
    payload = {"id": task_id, "status": "DONE"}
    res = post_action("update_task", payload)
    if res and res.get("success"):
        print(f"✓ Task {task_id} marked as DONE!")
    else:
        print("Failed to update task:", res)

def status_summary():
    data = get_sync_data()
    if not data or not data.get("success"):
        return
    stats = data.get("stats", {})
    print("\n=== SIAM MANAGEMENT SYSTEM - LIVE OVERVIEW ===")
    print(f"• Active Tasks:    {stats.get('pendingTasks', 0)} pending / {stats.get('completedTasks', 0)} completed")
    print(f"• Net Balance:     ৳{stats.get('netBalanceBDT', 0):,.2f}")
    print(f"• Total Income:    ৳{stats.get('totalIncomeBDT', 0):,.2f}")
    print(f"• Total Expense:   ৳{stats.get('totalExpenseBDT', 0):,.2f}")
    print(f"• Total Saved:     ৳{stats.get('totalSavingsBDT', 0):,.2f}")
    
    habits = data.get("habits", [])
    print(f"\n• Habits Tracked ({len(habits)}):")
    for h in habits:
        done = "✓ TODAY DONE" if h.get("isCompletedToday") else "○ PENDING"
        print(f"   - {h['name']} [{done}]")
    print()

if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] == "status":
        status_summary()
    elif sys.argv[1] in ["tasks", "list"]:
        list_tasks()
    elif sys.argv[1] == "add":
        title = sys.argv[2] if len(sys.argv) > 2 else "New Task"
        desc = sys.argv[3] if len(sys.argv) > 3 else ""
        prio = sys.argv[4] if len(sys.argv) > 4 else "MEDIUM"
        add_task(title, desc, prio)
    elif sys.argv[1] == "done":
        if len(sys.argv) > 2:
            complete_task(sys.argv[2])
        else:
            print("Usage: python agent_sync.py done <task_id>")
