import { Request, Response } from 'express';
import databaseService from '../services/databaseService';
import { WorkflowEngine, WorkflowDef } from '../engine/WorkflowEngine';

const prisma = databaseService.getPrisma();

/**
 * Workflow Controller - Handles workflow CRUD operations
 */
export class WorkflowController {
  /**
   * Get all workflows
   * GET /api/workflows
   */
  static async getAllWorkflows(req: Request, res: Response): Promise<void> {
    try {
      const workflows = await prisma.workflow.findMany({
        orderBy: { updatedAt: 'desc' },
      });

      res.json({
        success: true,
        data: workflows,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch workflows',
      });
    }
  }

  /**
   * Get a single workflow by ID
   * GET /api/workflows/:id
   */
  static async getWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const workflowId = id as string;

      const workflow = await prisma.workflow.findUnique({
        where: { id: workflowId },
        include: {
          executions: {
            orderBy: { startedAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!workflow) {
        res.status(404).json({
          success: false,
          error: 'Workflow not found',
        });
        return;
      }

      res.json({
        success: true,
        data: workflow,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch workflow',
      });
    }
  }

  /**
   * Create a new workflow
   * POST /api/workflows
   */
  static async createWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, nodes, edges } = req.body;

      // Validate input
      if (!name) {
        res.status(400).json({
          success: false,
          error: 'Workflow name is required',
        });
        return;
      }

      // Create workflow
      const workflow = await prisma.workflow.create({
        data: {
          name,
          description: description || null,
          nodes: nodes || [],
          edges: edges || [],
        },
      });

      res.status(201).json({
        success: true,
        data: workflow,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create workflow',
      });
    }
  }

  /**
   * Update a workflow
   * PUT /api/workflows/:id
   */
  static async updateWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const workflowId = id as string;
      const { name, description, nodes, edges, isActive } = req.body;

      // Check if workflow exists
      const existing = await prisma.workflow.findUnique({
        where: { id: workflowId },
      });

      if (!existing) {
        res.status(404).json({
          success: false,
          error: 'Workflow not found',
        });
        return;
      }

      // Update workflow
      const workflow = await prisma.workflow.update({
        where: { id: workflowId },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(nodes !== undefined && { nodes }),
          ...(edges !== undefined && { edges }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      res.json({
        success: true,
        data: workflow,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update workflow',
      });
    }
  }

  /**
   * Delete a workflow
   * DELETE /api/workflows/:id
   */
  static async deleteWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const workflowId = id as string;

      // Check if workflow exists
      const existing = await prisma.workflow.findUnique({
        where: { id: workflowId },
      });

      if (!existing) {
        res.status(404).json({
          success: false,
          error: 'Workflow not found',
        });
        return;
      }

      // Delete workflow (executions will be cascade deleted)
      await prisma.workflow.delete({
        where: { id: workflowId },
      });

      res.json({
        success: true,
        message: 'Workflow deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete workflow',
      });
    }
  }

  /**
   * Execute a workflow manually
   * POST /api/workflows/:id/execute
   */
  static async executeWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const workflowId = id as string;
      const data = req.body || {};

      // Fetch workflow
      const workflow = await prisma.workflow.findUnique({
        where: { id: workflowId },
      });

      if (!workflow) {
        res.status(404).json({
          success: false,
          error: 'Workflow not found',
        });
        return;
      }

      // Build workflow definition
      const workflowDef: WorkflowDef = {
        id: workflow.id,
        name: workflow.name,
        nodes: workflow.nodes as any,
        edges: workflow.edges as any,
      };

      // Validate workflow
      WorkflowEngine.validateWorkflow(workflowDef);

      // Execute workflow
      const result = await WorkflowEngine.executeWorkflow(workflowDef, data);

      // Store execution records
      const nodes = workflow.nodes as any[];
      for (const [nodeId, nodeResult] of result.results.entries()) {
        const nodeDef = nodes.find((n: any) => n.id === nodeId);
        await prisma.nodeExecution.create({
          data: {
            workflowId: workflow.id,
            nodeId,
            nodeName: nodeDef?.data?.label || nodeId,
            status: nodeResult.success ? 'success' : 'error',
            input: data,
            output: nodeResult.data,
            error: nodeResult.error,
            completedAt: new Date(),
          },
        });
      }

      // Send response
      if (result.success) {
        res.json({
          success: true,
          data: {
            results: Array.from(result.results.entries()),
            executionTime: result.executionTime,
          },
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Workflow execution failed',
          details: result.errors,
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to execute workflow',
      });
    }
  }

  /**
   * Get workflow execution history
   * GET /api/workflows/:id/executions
   */
  static async getWorkflowExecutions(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const workflowId = id as string;
      const limit = parseInt(req.query.limit as string) || 50;

      const executions = await prisma.nodeExecution.findMany({
        where: { workflowId },
        orderBy: { startedAt: 'desc' },
        take: limit,
      });

      res.json({
        success: true,
        data: executions,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch executions',
      });
    }
  }
}

export default WorkflowController;
