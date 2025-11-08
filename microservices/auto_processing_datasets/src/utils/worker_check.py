"""Utility to check if Celery workers are running."""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))


def check_celery_worker():
    """
    Check if Celery workers are running and return status.
    
    Returns:
        dict: {
            'running': bool,
            'workers': int,
            'tasks': list of registered task names
        }
    """
    try:
        # Lazy import to avoid circular dependency
        from src.celery_app import celery_app
        
        # Use Celery inspect to check active workers
        inspect = celery_app.control.inspect()
        
        # Try stats first (more reliable)
        stats = inspect.stats()
        if stats is None or not stats:
            # No workers responding
            return {
                'running': False,
                'workers': 0,
                'tasks': []
            }
        
        # Count workers
        worker_count = len(stats)
        
        # Get registered tasks
        task_names = []
        try:
            registered_tasks = inspect.registered()
            if registered_tasks:
                all_tasks = set()
                # registered_tasks is usually a dict: {worker_name: {task_name: {...}}}
                if isinstance(registered_tasks, dict):
                    for worker_name, worker_tasks in registered_tasks.items():
                        if isinstance(worker_tasks, dict):
                            all_tasks.update(worker_tasks.keys())
                        elif isinstance(worker_tasks, list):
                            all_tasks.update(worker_tasks)
                elif isinstance(registered_tasks, list):
                    # If it's a list, iterate through items
                    for item in registered_tasks:
                        if isinstance(item, dict):
                            all_tasks.update(item.keys())
                        elif isinstance(item, str):
                            all_tasks.add(item)
                task_names = list(all_tasks)
        except Exception:
            # If we can't get registered tasks, that's okay - we know workers are running
            pass
        
        return {
            'running': worker_count > 0,
            'workers': worker_count,
            'tasks': task_names
        }
        
    except Exception as e:
        # If inspection fails, assume no workers
        import traceback
        print(f"Warning: Could not check worker status: {e}")
        print(traceback.format_exc())
        return {
            'running': False,
            'workers': 0,
            'tasks': []
        }

