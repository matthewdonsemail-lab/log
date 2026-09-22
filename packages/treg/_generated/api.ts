/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as dist__generated_dataModel from "../dist/_generated/dataModel.js";
import type * as dist__generated_server from "../dist/_generated/server.js";
import type * as dist_lib_treg from "../dist/lib/treg.js";
import type * as dist_treg from "../dist/treg.js";
import type * as lib_treg from "../lib/treg.js";
import type * as treg from "../treg.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import { anyApi, componentsGeneric } from "convex/server";

const fullApi: ApiFromModules<{
  "dist/_generated/dataModel": typeof dist__generated_dataModel;
  "dist/_generated/server": typeof dist__generated_server;
  "dist/lib/treg": typeof dist_lib_treg;
  "dist/treg": typeof dist_treg;
  "lib/treg": typeof lib_treg;
  treg: typeof treg;
}> = anyApi as any;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
> = anyApi as any;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
> = anyApi as any;

export const components = componentsGeneric() as unknown as {};
