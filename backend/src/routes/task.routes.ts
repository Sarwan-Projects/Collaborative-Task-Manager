import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate, validateQuery } from '../middleware/validate.middleware';
import { CreateTaskDto, UpdateTaskDto, TaskFilterDto } from '../dtos/task.dto';

const router = Router();

// All task routes require authentication
router.use(authenticate);

/**
 * @route GET /api/v1/tasks/dashboard
 * @desc Get dashboard data (assigned, created, overdue tasks)
 * @access Private
 */
router.get('/dashboard', (req, res, next) =>
  taskController.getDashboard(req, res, next)
);

/**
 * @route GET /api/v1/tasks
 * @desc Get all tasks with optional filters
 * @access Private
 */
router.get('/', validateQuery(TaskFilterDto), (req, res, next) =>
  taskController.getTasks(req, res, next)
);

/**
 * @route POST /api/v1/tasks
 * @desc Create a new task
 * @access Private
 */
router.post('/', validate(CreateTaskDto), (req, res, next) =>
  taskController.createTask(req, res, next)
);

/**
 * @route GET /api/v1/tasks/:id
 * @desc Get a single task by ID
 * @access Private
 */
router.get('/:id', (req, res, next) =>
  taskController.getTask(req, res, next)
);

/**
 * @route PUT /api/v1/tasks/:id
 * @desc Update a task
 * @access Private
 */
router.put('/:id', validate(UpdateTaskDto), (req, res, next) =>
  taskController.updateTask(req, res, next)
);

/**
 * @route DELETE /api/v1/tasks/:id
 * @desc Delete a task
 * @access Private
 */
router.delete('/:id', (req, res, next) =>
  taskController.deleteTask(req, res, next)
);

/**
 * @route GET /api/v1/tasks/:id/audit
 * @desc Get audit logs for a task
 * @access Private
 */
router.get('/:id/audit', (req, res, next) =>
  taskController.getAuditLogs(req, res, next)
);

export default router;
