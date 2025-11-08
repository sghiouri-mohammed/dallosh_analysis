import threading
from typing import Dict, Optional
from enum import Enum
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.configs.constants import (
    PROCESS_PAUSE, PROCESS_RESUME, PROCESS_STOP,
    TASK_STATUS_PAUSED, TASK_STATUS_STOPPED
)


class TaskState(Enum):
    """Task state enumeration."""
    PENDING = "pending"
    RUNNING = "running"
    PAUSED = "paused"
    STOPPED = "stopped"
    COMPLETED = "completed"
    ERROR = "error"


class TaskManager:
    """Task manager for handling queue with pause/resume/stop capabilities."""
    
    def __init__(self):
        self.tasks: Dict[str, Dict] = {}  # file_id -> task info
        self.queue: list = []  # Queue of file_ids
        self.current_task: Optional[str] = None  # Current processing file_id
        self.lock = threading.Lock()
        self.pause_event = threading.Event()
        self.pause_event.set()  # Initially not paused
    
    def add_task(self, file_id: str, task_data: dict) -> None:
        """Add a task to the queue."""
        with self.lock:
            if file_id not in self.tasks:
                self.tasks[file_id] = {
                    'file_id': file_id,
                    'state': TaskState.PENDING,
                    'data': task_data,
                    'current_step': None,
                }
                self.queue.append(file_id)
                print(f"Task {file_id} added to queue")
    
    def get_next_task(self) -> Optional[str]:
        """Get the next task from the queue."""
        with self.lock:
            # Remove stopped tasks from queue
            self.queue = [fid for fid in self.queue if self.tasks.get(fid, {}).get('state') != TaskState.STOPPED]
            
            if not self.queue:
                return None
            
            # Get first pending task
            for file_id in self.queue:
                task = self.tasks.get(file_id)
                if task and task['state'] == TaskState.PENDING:
                    return file_id
            
            return None
    
    def start_task(self, file_id: str) -> bool:
        """Start processing a task."""
        with self.lock:
            if file_id not in self.tasks:
                return False
            
            task = self.tasks[file_id]
            if task['state'] in [TaskState.PENDING, TaskState.PAUSED]:
                task['state'] = TaskState.RUNNING
                self.current_task = file_id
                self.pause_event.set()  # Ensure not paused
                return True
            return False
    
    def pause_task(self, file_id: str) -> bool:
        """Pause a task."""
        with self.lock:
            if file_id not in self.tasks:
                return False
            
            task = self.tasks[file_id]
            if task['state'] == TaskState.RUNNING:
                task['state'] = TaskState.PAUSED
                if self.current_task == file_id:
                    self.pause_event.clear()  # Set pause event
                return True
            return False
    
    def resume_task(self, file_id: str) -> bool:
        """Resume a paused task."""
        with self.lock:
            if file_id not in self.tasks:
                return False
            
            task = self.tasks[file_id]
            if task['state'] == TaskState.PAUSED:
                task['state'] = TaskState.RUNNING
                if self.current_task == file_id:
                    self.pause_event.set()  # Clear pause event
                return True
            return False
    
    def stop_task(self, file_id: str) -> bool:
        """Stop a task and remove it from queue."""
        with self.lock:
            if file_id not in self.tasks:
                return False
            
            task = self.tasks[file_id]
            task['state'] = TaskState.STOPPED
            
            if self.current_task == file_id:
                self.current_task = None
                self.pause_event.set()  # Clear pause event
            
            # Remove from queue
            if file_id in self.queue:
                self.queue.remove(file_id)
            
            return True
    
    def complete_task(self, file_id: str) -> None:
        """Mark a task as completed."""
        with self.lock:
            if file_id in self.tasks:
                self.tasks[file_id]['state'] = TaskState.COMPLETED
                if self.current_task == file_id:
                    self.current_task = None
                if file_id in self.queue:
                    self.queue.remove(file_id)
    
    def set_task_error(self, file_id: str, error: str) -> None:
        """Set task to error state."""
        with self.lock:
            if file_id in self.tasks:
                self.tasks[file_id]['state'] = TaskState.ERROR
                self.tasks[file_id]['error'] = error
    
    def update_task_step(self, file_id: str, step: str) -> None:
        """Update the current step of a task."""
        with self.lock:
            if file_id in self.tasks:
                self.tasks[file_id]['current_step'] = step
    
    def get_task(self, file_id: str) -> Optional[dict]:
        """Get task information."""
        with self.lock:
            return self.tasks.get(file_id)
    
    def is_paused(self) -> bool:
        """Check if current task is paused."""
        return not self.pause_event.is_set()
    
    def wait_if_paused(self) -> None:
        """Wait if task is paused."""
        self.pause_event.wait()
    
    def handle_process_event(self, file_id: str, event: str) -> bool:
        """Handle process control events (pause/resume/stop)."""
        if event == PROCESS_PAUSE:
            return self.pause_task(file_id)
        elif event == PROCESS_RESUME:
            return self.resume_task(file_id)
        elif event == PROCESS_STOP:
            return self.stop_task(file_id)
        else:
            return False

