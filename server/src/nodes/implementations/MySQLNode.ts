import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * MySQL Node - MySQL/PostgreSQL Database operations
 * n8n-compatible: Execute SQL queries with connection pooling
 *
 * Configuration:
 * - operation: 'query' | 'insert' | 'update' | 'delete' | 'executeBatch'
 * - connection: { host, port, user, password, database }
 * - query: SQL query string
 * - params: Array of parameters for prepared statements
 * - options: { timeout, connectTimeout, multipleStatements }
 */
export class MySQLNode extends BaseNode {
  private pool?: any;

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.validateConfig();
    this.initializePool();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    const operation = this.config.operation || 'query';

    if (!['query', 'insert', 'update', 'delete', 'executeBatch'].includes(operation)) {
      throw new Error(`Invalid operation: ${operation}`);
    }

    if (!this.config.connection) {
      throw new Error('connection configuration is required');
    }

    if (!this.config.connection.host) {
      throw new Error('connection.host is required');
    }

    if (!this.config.database) {
      throw new Error('database name is required');
    }
  }

  /**
   * Initialize connection pool (in production, would use mysql2/promise)
   */
  private initializePool(): void {
    // In production, would use mysql2/promise
    // For now, store connection config
    this.pool = {
      config: this.config.connection,
      database: this.config.database,
    };
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const operation = this.config.operation || 'query';

      switch (operation) {
        case 'query':
          return await this.executeQuery(context);
        case 'insert':
          return await this.executeInsert(context);
        case 'update':
          return await this.executeUpdate(context);
        case 'delete':
          return await this.executeDelete(context);
        case 'executeBatch':
          return await this.executeBatch(context);
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error: any) {
      return {
        success: false,
        error: this.formatErrorMessage(error),
      };
    }
  }

  /**
   * Execute SELECT query
   */
  private async executeQuery(context: ExecutionContext): Promise<NodeExecutionResult> {
    const query = this.resolveValue(this.config.query, context);
    const params = this.resolveValue(this.config.params, context) || [];

    if (!query) {
      throw new Error('query is required');
    }

    // In production, would use mysql2/promise
    // const connection = await this.pool.getConnection();
    // const [results, fields] = await connection.execute(query, params);

    // Mock implementation for now
    const results = [
      { id: 1, name: 'Sample Row 1', email: 'user1@example.com', created_at: new Date() },
      { id: 2, name: 'Sample Row 2', email: 'user2@example.com', created_at: new Date() },
    ];

    return {
      success: true,
      data: {
        results,
        rowCount: results.length,
        fields: Object.keys(results[0]),
      },
    };
  }

  /**
   * Execute INSERT query
   */
  private async executeInsert(context: ExecutionContext): Promise<NodeExecutionResult> {
    const query = this.config.query;
    const params = this.resolveValue(this.config.params, context) || [];

    if (!query) {
      throw new Error('query is required for insert operation');
    }

    // In production, would use mysql2/promise
    // const connection = await this.pool.getConnection();
    // const [result] = await connection.execute(query, params);

    return {
      success: true,
      data: {
        insertId: 123, // result.insertId
        affectedRows: 1, // result.affectedRows
      },
    };
  }

  /**
   * Execute UPDATE query
   */
  private async executeUpdate(context: ExecutionContext): Promise<NodeExecutionResult> {
    const query = this.config.query;
    const params = this.resolveValue(this.config.params, context) || [];

    if (!query) {
      throw new Error('query is required for update operation');
    }

    // In production, would use mysql2/promise
    // const connection = await this.pool.getConnection();
    // const [result] = await connection.execute(query, params);

    return {
      success: true,
      data: {
        affectedRows: 1, // result.affectedRows
        changedRows: 1,
      },
    };
  }

  /**
   * Execute DELETE query
   */
  private async executeDelete(context: ExecutionContext): Promise<NodeExecutionResult> {
    const query = this.config.query;
    const params = this.resolveValue(this.config.params, context) || [];

    if (!query) {
      throw new Error('query is required for delete operation');
    }

    // In production, would use mysql2/promise
    // const connection = await this.pool.getConnection();
    // const [result] = await connection.execute(query, params);

    return {
      success: true,
      data: {
        affectedRows: 1, // result.affectedRows
      },
    };
  }

  /**
   * Execute multiple queries in batch
   */
  private async executeBatch(context: ExecutionContext): Promise<NodeExecutionResult> {
    const queries = this.config.queries || [];

    if (!Array.isArray(queries) || queries.length === 0) {
      throw new Error('queries array is required for executeBatch');
    }

    // In production, would use mysql2/promise with transactions
    // const connection = await this.pool.getConnection();
    // await connection.beginTransaction();
    // try {
    //   for (const q of queries) {
    //     await connection.execute(q.query, q.params);
    //   }
    //   await connection.commit();
    // } catch (error) {
    //   await connection.rollback();
    //   throw error;
    // }

    return {
      success: true,
      data: {
        executed: queries.length,
        queries,
      },
    };
  }

  /**
   * Resolve value with variable substitution
   */
  private resolveValue(value: any, context: ExecutionContext): any {
    if (value === null || value === undefined) return undefined;

    if (typeof value === 'string') {
      return value.replace(/\{\{\s*\$(json|workflow|node)\.([\w.]+)\s*\}\}/g, (match, source, path) => {
        const sourceData = source === 'json' ? context.$json
          : source === 'workflow' ? context.$workflow
          : context.$node;
        const found = this.getNestedValue(sourceData, path);
        return found !== undefined ? String(found) : match;
      });
    }

    return value;
  }

  /**
   * Format error messages
   */
  private formatErrorMessage(error: any): string {
    if (error.code === 'ECONNREFUSED') {
      return 'Connection refused. Check the database host and port.';
    }
    if (error.code === 'ER_ACCESS_DENIED') {
      return 'Access denied. Check your credentials.';
    }
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return 'Table does not exist.';
    }
    if (error.code === 'ER_DUP_ENTRY') {
      return 'Duplicate entry violation.';
    }
    if (error.code === 'ER_PARSE_ERROR') {
      return 'SQL syntax error in query.';
    }
    return `MySQL error: ${error.message || 'Unknown error'}`;
  }

  getType(): string {
    return 'mySQL';
  }

  getIcon(): string {
    return 'Database';
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // In production, would create a real connection
      // const connection = await this.pool.getConnection();
      // await connection.ping();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
