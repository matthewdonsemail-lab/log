import {
  queryGeneric, mutationGeneric, internalMutationGeneric, actionGeneric,
  type ActionBuilder,
  type DataModelFromSchemaDefinition, type QueryBuilder, type MutationBuilder,
  type GenericQueryCtx, type GenericMutationCtx,
} from 'convex/server'
import { ConvexError } from 'convex/values'
import type schema from '../schema'

// Schema-derived types work before the first deployment/code generation.
type DataModel = DataModelFromSchemaDefinition<typeof schema>
export type MutationCtx = GenericMutationCtx<DataModel>
export const query = queryGeneric as QueryBuilder<DataModel, 'public'>
export const mutation = mutationGeneric as MutationBuilder<DataModel, 'public'>
export const internalMutation = internalMutationGeneric as MutationBuilder<DataModel, 'internal'>
export const action = actionGeneric as ActionBuilder<DataModel, 'public'>

export async function requireOwner(ctx: Pick<GenericQueryCtx<DataModel>, 'auth'>): Promise<string> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) throw new ConvexError('Authentication required')
  return identity.tokenIdentifier
}
