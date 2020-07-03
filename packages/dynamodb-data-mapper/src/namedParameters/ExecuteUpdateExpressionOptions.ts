import { ConditionExpression } from '@block65/dynamodb-expressions';

export interface ExecuteUpdateExpressionOptions {
    /**
     * A condition on which this update operation's completion will be
     * predicated.
     */
    condition?: ConditionExpression;
}
