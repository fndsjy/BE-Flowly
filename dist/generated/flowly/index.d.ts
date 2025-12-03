
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Role
 * Role defines user permissions and access tiers
 * Level: 1 = Super Admin, 2 = Supervisor, 3 = Staff, 4 = Non Staff, 5 = Guest
 */
export type Role = $Result.DefaultSelection<Prisma.$RolePayload>
/**
 * Model User
 * User represents an authenticated individual in the system
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model OrgStructure
 * 
 */
export type OrgStructure = $Result.DefaultSelection<Prisma.$OrgStructurePayload>
/**
 * Model OrgChart
 * 
 */
export type OrgChart = $Result.DefaultSelection<Prisma.$OrgChartPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Roles
 * const roles = await prisma.role.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Roles
   * const roles = await prisma.role.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.role`: Exposes CRUD operations for the **Role** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Roles
    * const roles = await prisma.role.findMany()
    * ```
    */
  get role(): Prisma.RoleDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.orgStructure`: Exposes CRUD operations for the **OrgStructure** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OrgStructures
    * const orgStructures = await prisma.orgStructure.findMany()
    * ```
    */
  get orgStructure(): Prisma.OrgStructureDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.orgChart`: Exposes CRUD operations for the **OrgChart** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OrgCharts
    * const orgCharts = await prisma.orgChart.findMany()
    * ```
    */
  get orgChart(): Prisma.OrgChartDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.0
   * Query Engine version: 2ba551f319ab1df4bc874a89965d8b3641056773
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Role: 'Role',
    User: 'User',
    OrgStructure: 'OrgStructure',
    OrgChart: 'OrgChart'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "role" | "user" | "orgStructure" | "orgChart"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Role: {
        payload: Prisma.$RolePayload<ExtArgs>
        fields: Prisma.RoleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RoleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RoleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>
          }
          findFirst: {
            args: Prisma.RoleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RoleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>
          }
          findMany: {
            args: Prisma.RoleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>[]
          }
          create: {
            args: Prisma.RoleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>
          }
          createMany: {
            args: Prisma.RoleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.RoleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>
          }
          update: {
            args: Prisma.RoleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>
          }
          deleteMany: {
            args: Prisma.RoleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RoleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.RoleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>
          }
          aggregate: {
            args: Prisma.RoleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRole>
          }
          groupBy: {
            args: Prisma.RoleGroupByArgs<ExtArgs>
            result: $Utils.Optional<RoleGroupByOutputType>[]
          }
          count: {
            args: Prisma.RoleCountArgs<ExtArgs>
            result: $Utils.Optional<RoleCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      OrgStructure: {
        payload: Prisma.$OrgStructurePayload<ExtArgs>
        fields: Prisma.OrgStructureFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrgStructureFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgStructurePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrgStructureFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgStructurePayload>
          }
          findFirst: {
            args: Prisma.OrgStructureFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgStructurePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrgStructureFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgStructurePayload>
          }
          findMany: {
            args: Prisma.OrgStructureFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgStructurePayload>[]
          }
          create: {
            args: Prisma.OrgStructureCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgStructurePayload>
          }
          createMany: {
            args: Prisma.OrgStructureCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.OrgStructureDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgStructurePayload>
          }
          update: {
            args: Prisma.OrgStructureUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgStructurePayload>
          }
          deleteMany: {
            args: Prisma.OrgStructureDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrgStructureUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.OrgStructureUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgStructurePayload>
          }
          aggregate: {
            args: Prisma.OrgStructureAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrgStructure>
          }
          groupBy: {
            args: Prisma.OrgStructureGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrgStructureGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrgStructureCountArgs<ExtArgs>
            result: $Utils.Optional<OrgStructureCountAggregateOutputType> | number
          }
        }
      }
      OrgChart: {
        payload: Prisma.$OrgChartPayload<ExtArgs>
        fields: Prisma.OrgChartFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrgChartFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgChartPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrgChartFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgChartPayload>
          }
          findFirst: {
            args: Prisma.OrgChartFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgChartPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrgChartFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgChartPayload>
          }
          findMany: {
            args: Prisma.OrgChartFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgChartPayload>[]
          }
          create: {
            args: Prisma.OrgChartCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgChartPayload>
          }
          createMany: {
            args: Prisma.OrgChartCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.OrgChartDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgChartPayload>
          }
          update: {
            args: Prisma.OrgChartUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgChartPayload>
          }
          deleteMany: {
            args: Prisma.OrgChartDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrgChartUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.OrgChartUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgChartPayload>
          }
          aggregate: {
            args: Prisma.OrgChartAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrgChart>
          }
          groupBy: {
            args: Prisma.OrgChartGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrgChartGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrgChartCountArgs<ExtArgs>
            result: $Utils.Optional<OrgChartCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    role?: RoleOmit
    user?: UserOmit
    orgStructure?: OrgStructureOmit
    orgChart?: OrgChartOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type RoleCountOutputType
   */

  export type RoleCountOutputType = {
    users: number
  }

  export type RoleCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | RoleCountOutputTypeCountUsersArgs
  }

  // Custom InputTypes
  /**
   * RoleCountOutputType without action
   */
  export type RoleCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoleCountOutputType
     */
    select?: RoleCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * RoleCountOutputType without action
   */
  export type RoleCountOutputTypeCountUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    createdUsers: number
    updatedUsers: number
    deletedUsers: number
    createdRoles: number
    updatedRoles: number
    deletedRoles: number
    orgNodes: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdUsers?: boolean | UserCountOutputTypeCountCreatedUsersArgs
    updatedUsers?: boolean | UserCountOutputTypeCountUpdatedUsersArgs
    deletedUsers?: boolean | UserCountOutputTypeCountDeletedUsersArgs
    createdRoles?: boolean | UserCountOutputTypeCountCreatedRolesArgs
    updatedRoles?: boolean | UserCountOutputTypeCountUpdatedRolesArgs
    deletedRoles?: boolean | UserCountOutputTypeCountDeletedRolesArgs
    orgNodes?: boolean | UserCountOutputTypeCountOrgNodesArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountCreatedUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountUpdatedUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountDeletedUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountCreatedRolesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RoleWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountUpdatedRolesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RoleWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountDeletedRolesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RoleWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountOrgNodesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrgChartWhereInput
  }


  /**
   * Count Type OrgStructureCountOutputType
   */

  export type OrgStructureCountOutputType = {
    nodes: number
  }

  export type OrgStructureCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    nodes?: boolean | OrgStructureCountOutputTypeCountNodesArgs
  }

  // Custom InputTypes
  /**
   * OrgStructureCountOutputType without action
   */
  export type OrgStructureCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgStructureCountOutputType
     */
    select?: OrgStructureCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OrgStructureCountOutputType without action
   */
  export type OrgStructureCountOutputTypeCountNodesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrgChartWhereInput
  }


  /**
   * Count Type OrgChartCountOutputType
   */

  export type OrgChartCountOutputType = {
    children: number
  }

  export type OrgChartCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    children?: boolean | OrgChartCountOutputTypeCountChildrenArgs
  }

  // Custom InputTypes
  /**
   * OrgChartCountOutputType without action
   */
  export type OrgChartCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgChartCountOutputType
     */
    select?: OrgChartCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OrgChartCountOutputType without action
   */
  export type OrgChartCountOutputTypeCountChildrenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrgChartWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Role
   */

  export type AggregateRole = {
    _count: RoleCountAggregateOutputType | null
    _avg: RoleAvgAggregateOutputType | null
    _sum: RoleSumAggregateOutputType | null
    _min: RoleMinAggregateOutputType | null
    _max: RoleMaxAggregateOutputType | null
  }

  export type RoleAvgAggregateOutputType = {
    roleLevel: number | null
  }

  export type RoleSumAggregateOutputType = {
    roleLevel: number | null
  }

  export type RoleMinAggregateOutputType = {
    roleId: string | null
    roleName: string | null
    roleLevel: number | null
    roleDesc: string | null
    roleIsActive: boolean | null
    createdAt: Date | null
    createdBy: string | null
    updatedAt: Date | null
    updatedBy: string | null
    isDeleted: boolean | null
    deletedAt: Date | null
    deletedBy: string | null
  }

  export type RoleMaxAggregateOutputType = {
    roleId: string | null
    roleName: string | null
    roleLevel: number | null
    roleDesc: string | null
    roleIsActive: boolean | null
    createdAt: Date | null
    createdBy: string | null
    updatedAt: Date | null
    updatedBy: string | null
    isDeleted: boolean | null
    deletedAt: Date | null
    deletedBy: string | null
  }

  export type RoleCountAggregateOutputType = {
    roleId: number
    roleName: number
    roleLevel: number
    roleDesc: number
    roleIsActive: number
    createdAt: number
    createdBy: number
    updatedAt: number
    updatedBy: number
    isDeleted: number
    deletedAt: number
    deletedBy: number
    _all: number
  }


  export type RoleAvgAggregateInputType = {
    roleLevel?: true
  }

  export type RoleSumAggregateInputType = {
    roleLevel?: true
  }

  export type RoleMinAggregateInputType = {
    roleId?: true
    roleName?: true
    roleLevel?: true
    roleDesc?: true
    roleIsActive?: true
    createdAt?: true
    createdBy?: true
    updatedAt?: true
    updatedBy?: true
    isDeleted?: true
    deletedAt?: true
    deletedBy?: true
  }

  export type RoleMaxAggregateInputType = {
    roleId?: true
    roleName?: true
    roleLevel?: true
    roleDesc?: true
    roleIsActive?: true
    createdAt?: true
    createdBy?: true
    updatedAt?: true
    updatedBy?: true
    isDeleted?: true
    deletedAt?: true
    deletedBy?: true
  }

  export type RoleCountAggregateInputType = {
    roleId?: true
    roleName?: true
    roleLevel?: true
    roleDesc?: true
    roleIsActive?: true
    createdAt?: true
    createdBy?: true
    updatedAt?: true
    updatedBy?: true
    isDeleted?: true
    deletedAt?: true
    deletedBy?: true
    _all?: true
  }

  export type RoleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Role to aggregate.
     */
    where?: RoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Roles to fetch.
     */
    orderBy?: RoleOrderByWithRelationInput | RoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Roles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Roles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Roles
    **/
    _count?: true | RoleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RoleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RoleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RoleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RoleMaxAggregateInputType
  }

  export type GetRoleAggregateType<T extends RoleAggregateArgs> = {
        [P in keyof T & keyof AggregateRole]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRole[P]>
      : GetScalarType<T[P], AggregateRole[P]>
  }




  export type RoleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RoleWhereInput
    orderBy?: RoleOrderByWithAggregationInput | RoleOrderByWithAggregationInput[]
    by: RoleScalarFieldEnum[] | RoleScalarFieldEnum
    having?: RoleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RoleCountAggregateInputType | true
    _avg?: RoleAvgAggregateInputType
    _sum?: RoleSumAggregateInputType
    _min?: RoleMinAggregateInputType
    _max?: RoleMaxAggregateInputType
  }

  export type RoleGroupByOutputType = {
    roleId: string
    roleName: string
    roleLevel: number
    roleDesc: string | null
    roleIsActive: boolean
    createdAt: Date
    createdBy: string | null
    updatedAt: Date
    updatedBy: string | null
    isDeleted: boolean
    deletedAt: Date | null
    deletedBy: string | null
    _count: RoleCountAggregateOutputType | null
    _avg: RoleAvgAggregateOutputType | null
    _sum: RoleSumAggregateOutputType | null
    _min: RoleMinAggregateOutputType | null
    _max: RoleMaxAggregateOutputType | null
  }

  type GetRoleGroupByPayload<T extends RoleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RoleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RoleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RoleGroupByOutputType[P]>
            : GetScalarType<T[P], RoleGroupByOutputType[P]>
        }
      >
    >


  export type RoleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    roleId?: boolean
    roleName?: boolean
    roleLevel?: boolean
    roleDesc?: boolean
    roleIsActive?: boolean
    createdAt?: boolean
    createdBy?: boolean
    updatedAt?: boolean
    updatedBy?: boolean
    isDeleted?: boolean
    deletedAt?: boolean
    deletedBy?: boolean
    creator?: boolean | Role$creatorArgs<ExtArgs>
    updater?: boolean | Role$updaterArgs<ExtArgs>
    deleter?: boolean | Role$deleterArgs<ExtArgs>
    users?: boolean | Role$usersArgs<ExtArgs>
    _count?: boolean | RoleCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["role"]>



  export type RoleSelectScalar = {
    roleId?: boolean
    roleName?: boolean
    roleLevel?: boolean
    roleDesc?: boolean
    roleIsActive?: boolean
    createdAt?: boolean
    createdBy?: boolean
    updatedAt?: boolean
    updatedBy?: boolean
    isDeleted?: boolean
    deletedAt?: boolean
    deletedBy?: boolean
  }

  export type RoleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"roleId" | "roleName" | "roleLevel" | "roleDesc" | "roleIsActive" | "createdAt" | "createdBy" | "updatedAt" | "updatedBy" | "isDeleted" | "deletedAt" | "deletedBy", ExtArgs["result"]["role"]>
  export type RoleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    creator?: boolean | Role$creatorArgs<ExtArgs>
    updater?: boolean | Role$updaterArgs<ExtArgs>
    deleter?: boolean | Role$deleterArgs<ExtArgs>
    users?: boolean | Role$usersArgs<ExtArgs>
    _count?: boolean | RoleCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $RolePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Role"
    objects: {
      /**
       * Relations to User (audit trail)
       */
      creator: Prisma.$UserPayload<ExtArgs> | null
      updater: Prisma.$UserPayload<ExtArgs> | null
      deleter: Prisma.$UserPayload<ExtArgs> | null
      /**
       * Users assigned to this role
       */
      users: Prisma.$UserPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      /**
       * e.g., "ROL251117-0001"
       */
      roleId: string
      roleName: string
      roleLevel: number
      roleDesc: string | null
      roleIsActive: boolean
      createdAt: Date
      /**
       * references User.userId
       */
      createdBy: string | null
      updatedAt: Date
      /**
       * references User.userId
       */
      updatedBy: string | null
      isDeleted: boolean
      deletedAt: Date | null
      /**
       * references User.userId
       */
      deletedBy: string | null
    }, ExtArgs["result"]["role"]>
    composites: {}
  }

  type RoleGetPayload<S extends boolean | null | undefined | RoleDefaultArgs> = $Result.GetResult<Prisma.$RolePayload, S>

  type RoleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RoleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RoleCountAggregateInputType | true
    }

  export interface RoleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Role'], meta: { name: 'Role' } }
    /**
     * Find zero or one Role that matches the filter.
     * @param {RoleFindUniqueArgs} args - Arguments to find a Role
     * @example
     * // Get one Role
     * const role = await prisma.role.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RoleFindUniqueArgs>(args: SelectSubset<T, RoleFindUniqueArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Role that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RoleFindUniqueOrThrowArgs} args - Arguments to find a Role
     * @example
     * // Get one Role
     * const role = await prisma.role.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RoleFindUniqueOrThrowArgs>(args: SelectSubset<T, RoleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Role that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleFindFirstArgs} args - Arguments to find a Role
     * @example
     * // Get one Role
     * const role = await prisma.role.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RoleFindFirstArgs>(args?: SelectSubset<T, RoleFindFirstArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Role that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleFindFirstOrThrowArgs} args - Arguments to find a Role
     * @example
     * // Get one Role
     * const role = await prisma.role.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RoleFindFirstOrThrowArgs>(args?: SelectSubset<T, RoleFindFirstOrThrowArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Roles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Roles
     * const roles = await prisma.role.findMany()
     * 
     * // Get first 10 Roles
     * const roles = await prisma.role.findMany({ take: 10 })
     * 
     * // Only select the `roleId`
     * const roleWithRoleIdOnly = await prisma.role.findMany({ select: { roleId: true } })
     * 
     */
    findMany<T extends RoleFindManyArgs>(args?: SelectSubset<T, RoleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Role.
     * @param {RoleCreateArgs} args - Arguments to create a Role.
     * @example
     * // Create one Role
     * const Role = await prisma.role.create({
     *   data: {
     *     // ... data to create a Role
     *   }
     * })
     * 
     */
    create<T extends RoleCreateArgs>(args: SelectSubset<T, RoleCreateArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Roles.
     * @param {RoleCreateManyArgs} args - Arguments to create many Roles.
     * @example
     * // Create many Roles
     * const role = await prisma.role.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RoleCreateManyArgs>(args?: SelectSubset<T, RoleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Role.
     * @param {RoleDeleteArgs} args - Arguments to delete one Role.
     * @example
     * // Delete one Role
     * const Role = await prisma.role.delete({
     *   where: {
     *     // ... filter to delete one Role
     *   }
     * })
     * 
     */
    delete<T extends RoleDeleteArgs>(args: SelectSubset<T, RoleDeleteArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Role.
     * @param {RoleUpdateArgs} args - Arguments to update one Role.
     * @example
     * // Update one Role
     * const role = await prisma.role.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RoleUpdateArgs>(args: SelectSubset<T, RoleUpdateArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Roles.
     * @param {RoleDeleteManyArgs} args - Arguments to filter Roles to delete.
     * @example
     * // Delete a few Roles
     * const { count } = await prisma.role.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RoleDeleteManyArgs>(args?: SelectSubset<T, RoleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Roles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Roles
     * const role = await prisma.role.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RoleUpdateManyArgs>(args: SelectSubset<T, RoleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Role.
     * @param {RoleUpsertArgs} args - Arguments to update or create a Role.
     * @example
     * // Update or create a Role
     * const role = await prisma.role.upsert({
     *   create: {
     *     // ... data to create a Role
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Role we want to update
     *   }
     * })
     */
    upsert<T extends RoleUpsertArgs>(args: SelectSubset<T, RoleUpsertArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Roles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleCountArgs} args - Arguments to filter Roles to count.
     * @example
     * // Count the number of Roles
     * const count = await prisma.role.count({
     *   where: {
     *     // ... the filter for the Roles we want to count
     *   }
     * })
    **/
    count<T extends RoleCountArgs>(
      args?: Subset<T, RoleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RoleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Role.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RoleAggregateArgs>(args: Subset<T, RoleAggregateArgs>): Prisma.PrismaPromise<GetRoleAggregateType<T>>

    /**
     * Group by Role.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RoleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RoleGroupByArgs['orderBy'] }
        : { orderBy?: RoleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RoleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRoleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Role model
   */
  readonly fields: RoleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Role.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RoleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    creator<T extends Role$creatorArgs<ExtArgs> = {}>(args?: Subset<T, Role$creatorArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    updater<T extends Role$updaterArgs<ExtArgs> = {}>(args?: Subset<T, Role$updaterArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    deleter<T extends Role$deleterArgs<ExtArgs> = {}>(args?: Subset<T, Role$deleterArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    users<T extends Role$usersArgs<ExtArgs> = {}>(args?: Subset<T, Role$usersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Role model
   */
  interface RoleFieldRefs {
    readonly roleId: FieldRef<"Role", 'String'>
    readonly roleName: FieldRef<"Role", 'String'>
    readonly roleLevel: FieldRef<"Role", 'Int'>
    readonly roleDesc: FieldRef<"Role", 'String'>
    readonly roleIsActive: FieldRef<"Role", 'Boolean'>
    readonly createdAt: FieldRef<"Role", 'DateTime'>
    readonly createdBy: FieldRef<"Role", 'String'>
    readonly updatedAt: FieldRef<"Role", 'DateTime'>
    readonly updatedBy: FieldRef<"Role", 'String'>
    readonly isDeleted: FieldRef<"Role", 'Boolean'>
    readonly deletedAt: FieldRef<"Role", 'DateTime'>
    readonly deletedBy: FieldRef<"Role", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Role findUnique
   */
  export type RoleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
    /**
     * Filter, which Role to fetch.
     */
    where: RoleWhereUniqueInput
  }

  /**
   * Role findUniqueOrThrow
   */
  export type RoleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
    /**
     * Filter, which Role to fetch.
     */
    where: RoleWhereUniqueInput
  }

  /**
   * Role findFirst
   */
  export type RoleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
    /**
     * Filter, which Role to fetch.
     */
    where?: RoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Roles to fetch.
     */
    orderBy?: RoleOrderByWithRelationInput | RoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Roles.
     */
    cursor?: RoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Roles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Roles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Roles.
     */
    distinct?: RoleScalarFieldEnum | RoleScalarFieldEnum[]
  }

  /**
   * Role findFirstOrThrow
   */
  export type RoleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
    /**
     * Filter, which Role to fetch.
     */
    where?: RoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Roles to fetch.
     */
    orderBy?: RoleOrderByWithRelationInput | RoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Roles.
     */
    cursor?: RoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Roles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Roles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Roles.
     */
    distinct?: RoleScalarFieldEnum | RoleScalarFieldEnum[]
  }

  /**
   * Role findMany
   */
  export type RoleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
    /**
     * Filter, which Roles to fetch.
     */
    where?: RoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Roles to fetch.
     */
    orderBy?: RoleOrderByWithRelationInput | RoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Roles.
     */
    cursor?: RoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Roles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Roles.
     */
    skip?: number
    distinct?: RoleScalarFieldEnum | RoleScalarFieldEnum[]
  }

  /**
   * Role create
   */
  export type RoleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
    /**
     * The data needed to create a Role.
     */
    data: XOR<RoleCreateInput, RoleUncheckedCreateInput>
  }

  /**
   * Role createMany
   */
  export type RoleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Roles.
     */
    data: RoleCreateManyInput | RoleCreateManyInput[]
  }

  /**
   * Role update
   */
  export type RoleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
    /**
     * The data needed to update a Role.
     */
    data: XOR<RoleUpdateInput, RoleUncheckedUpdateInput>
    /**
     * Choose, which Role to update.
     */
    where: RoleWhereUniqueInput
  }

  /**
   * Role updateMany
   */
  export type RoleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Roles.
     */
    data: XOR<RoleUpdateManyMutationInput, RoleUncheckedUpdateManyInput>
    /**
     * Filter which Roles to update
     */
    where?: RoleWhereInput
    /**
     * Limit how many Roles to update.
     */
    limit?: number
  }

  /**
   * Role upsert
   */
  export type RoleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
    /**
     * The filter to search for the Role to update in case it exists.
     */
    where: RoleWhereUniqueInput
    /**
     * In case the Role found by the `where` argument doesn't exist, create a new Role with this data.
     */
    create: XOR<RoleCreateInput, RoleUncheckedCreateInput>
    /**
     * In case the Role was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RoleUpdateInput, RoleUncheckedUpdateInput>
  }

  /**
   * Role delete
   */
  export type RoleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
    /**
     * Filter which Role to delete.
     */
    where: RoleWhereUniqueInput
  }

  /**
   * Role deleteMany
   */
  export type RoleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Roles to delete
     */
    where?: RoleWhereInput
    /**
     * Limit how many Roles to delete.
     */
    limit?: number
  }

  /**
   * Role.creator
   */
  export type Role$creatorArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * Role.updater
   */
  export type Role$updaterArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * Role.deleter
   */
  export type Role$deleterArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * Role.users
   */
  export type Role$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * Role without action
   */
  export type RoleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
  }


  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    userId: string | null
    username: string | null
    password: string | null
    name: string | null
    badgeNumber: string | null
    department: string | null
    isActive: boolean | null
    lastLogin: Date | null
    createdAt: Date | null
    createdBy: string | null
    updatedAt: Date | null
    updatedBy: string | null
    isDeleted: boolean | null
    deletedAt: Date | null
    deletedBy: string | null
    roleId: string | null
    token: string | null
  }

  export type UserMaxAggregateOutputType = {
    userId: string | null
    username: string | null
    password: string | null
    name: string | null
    badgeNumber: string | null
    department: string | null
    isActive: boolean | null
    lastLogin: Date | null
    createdAt: Date | null
    createdBy: string | null
    updatedAt: Date | null
    updatedBy: string | null
    isDeleted: boolean | null
    deletedAt: Date | null
    deletedBy: string | null
    roleId: string | null
    token: string | null
  }

  export type UserCountAggregateOutputType = {
    userId: number
    username: number
    password: number
    name: number
    badgeNumber: number
    department: number
    isActive: number
    lastLogin: number
    createdAt: number
    createdBy: number
    updatedAt: number
    updatedBy: number
    isDeleted: number
    deletedAt: number
    deletedBy: number
    roleId: number
    token: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    userId?: true
    username?: true
    password?: true
    name?: true
    badgeNumber?: true
    department?: true
    isActive?: true
    lastLogin?: true
    createdAt?: true
    createdBy?: true
    updatedAt?: true
    updatedBy?: true
    isDeleted?: true
    deletedAt?: true
    deletedBy?: true
    roleId?: true
    token?: true
  }

  export type UserMaxAggregateInputType = {
    userId?: true
    username?: true
    password?: true
    name?: true
    badgeNumber?: true
    department?: true
    isActive?: true
    lastLogin?: true
    createdAt?: true
    createdBy?: true
    updatedAt?: true
    updatedBy?: true
    isDeleted?: true
    deletedAt?: true
    deletedBy?: true
    roleId?: true
    token?: true
  }

  export type UserCountAggregateInputType = {
    userId?: true
    username?: true
    password?: true
    name?: true
    badgeNumber?: true
    department?: true
    isActive?: true
    lastLogin?: true
    createdAt?: true
    createdBy?: true
    updatedAt?: true
    updatedBy?: true
    isDeleted?: true
    deletedAt?: true
    deletedBy?: true
    roleId?: true
    token?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    userId: string
    username: string
    password: string
    name: string
    badgeNumber: string
    department: string | null
    isActive: boolean
    lastLogin: Date | null
    createdAt: Date
    createdBy: string | null
    updatedAt: Date
    updatedBy: string | null
    isDeleted: boolean
    deletedAt: Date | null
    deletedBy: string | null
    roleId: string
    token: string | null
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    userId?: boolean
    username?: boolean
    password?: boolean
    name?: boolean
    badgeNumber?: boolean
    department?: boolean
    isActive?: boolean
    lastLogin?: boolean
    createdAt?: boolean
    createdBy?: boolean
    updatedAt?: boolean
    updatedBy?: boolean
    isDeleted?: boolean
    deletedAt?: boolean
    deletedBy?: boolean
    roleId?: boolean
    token?: boolean
    creator?: boolean | User$creatorArgs<ExtArgs>
    createdUsers?: boolean | User$createdUsersArgs<ExtArgs>
    updater?: boolean | User$updaterArgs<ExtArgs>
    updatedUsers?: boolean | User$updatedUsersArgs<ExtArgs>
    deleter?: boolean | User$deleterArgs<ExtArgs>
    deletedUsers?: boolean | User$deletedUsersArgs<ExtArgs>
    role?: boolean | RoleDefaultArgs<ExtArgs>
    createdRoles?: boolean | User$createdRolesArgs<ExtArgs>
    updatedRoles?: boolean | User$updatedRolesArgs<ExtArgs>
    deletedRoles?: boolean | User$deletedRolesArgs<ExtArgs>
    orgNodes?: boolean | User$orgNodesArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>



  export type UserSelectScalar = {
    userId?: boolean
    username?: boolean
    password?: boolean
    name?: boolean
    badgeNumber?: boolean
    department?: boolean
    isActive?: boolean
    lastLogin?: boolean
    createdAt?: boolean
    createdBy?: boolean
    updatedAt?: boolean
    updatedBy?: boolean
    isDeleted?: boolean
    deletedAt?: boolean
    deletedBy?: boolean
    roleId?: boolean
    token?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"userId" | "username" | "password" | "name" | "badgeNumber" | "department" | "isActive" | "lastLogin" | "createdAt" | "createdBy" | "updatedAt" | "updatedBy" | "isDeleted" | "deletedAt" | "deletedBy" | "roleId" | "token", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    creator?: boolean | User$creatorArgs<ExtArgs>
    createdUsers?: boolean | User$createdUsersArgs<ExtArgs>
    updater?: boolean | User$updaterArgs<ExtArgs>
    updatedUsers?: boolean | User$updatedUsersArgs<ExtArgs>
    deleter?: boolean | User$deleterArgs<ExtArgs>
    deletedUsers?: boolean | User$deletedUsersArgs<ExtArgs>
    role?: boolean | RoleDefaultArgs<ExtArgs>
    createdRoles?: boolean | User$createdRolesArgs<ExtArgs>
    updatedRoles?: boolean | User$updatedRolesArgs<ExtArgs>
    deletedRoles?: boolean | User$deletedRolesArgs<ExtArgs>
    orgNodes?: boolean | User$orgNodesArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      /**
       * Self-relations (audit trail)
       */
      creator: Prisma.$UserPayload<ExtArgs> | null
      createdUsers: Prisma.$UserPayload<ExtArgs>[]
      updater: Prisma.$UserPayload<ExtArgs> | null
      updatedUsers: Prisma.$UserPayload<ExtArgs>[]
      deleter: Prisma.$UserPayload<ExtArgs> | null
      deletedUsers: Prisma.$UserPayload<ExtArgs>[]
      role: Prisma.$RolePayload<ExtArgs>
      createdRoles: Prisma.$RolePayload<ExtArgs>[]
      updatedRoles: Prisma.$RolePayload<ExtArgs>[]
      deletedRoles: Prisma.$RolePayload<ExtArgs>[]
      orgNodes: Prisma.$OrgChartPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      /**
       * e.g., "USR251117-0001"
       */
      userId: string
      username: string
      /**
       * bcrypt/scrypt hashed
       */
      password: string
      name: string
      badgeNumber: string
      department: string | null
      isActive: boolean
      lastLogin: Date | null
      createdAt: Date
      /**
       * references User.userId
       */
      createdBy: string | null
      updatedAt: Date
      /**
       * references User.userId
       */
      updatedBy: string | null
      isDeleted: boolean
      deletedAt: Date | null
      /**
       * references User.userId
       */
      deletedBy: string | null
      /**
       * Role assignment
       */
      roleId: string
      /**
       * Optional auth token (e.g., refresh token)
       */
      token: string | null
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `userId`
     * const userWithUserIdOnly = await prisma.user.findMany({ select: { userId: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    creator<T extends User$creatorArgs<ExtArgs> = {}>(args?: Subset<T, User$creatorArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    createdUsers<T extends User$createdUsersArgs<ExtArgs> = {}>(args?: Subset<T, User$createdUsersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    updater<T extends User$updaterArgs<ExtArgs> = {}>(args?: Subset<T, User$updaterArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    updatedUsers<T extends User$updatedUsersArgs<ExtArgs> = {}>(args?: Subset<T, User$updatedUsersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    deleter<T extends User$deleterArgs<ExtArgs> = {}>(args?: Subset<T, User$deleterArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    deletedUsers<T extends User$deletedUsersArgs<ExtArgs> = {}>(args?: Subset<T, User$deletedUsersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    role<T extends RoleDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RoleDefaultArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    createdRoles<T extends User$createdRolesArgs<ExtArgs> = {}>(args?: Subset<T, User$createdRolesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    updatedRoles<T extends User$updatedRolesArgs<ExtArgs> = {}>(args?: Subset<T, User$updatedRolesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    deletedRoles<T extends User$deletedRolesArgs<ExtArgs> = {}>(args?: Subset<T, User$deletedRolesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    orgNodes<T extends User$orgNodesArgs<ExtArgs> = {}>(args?: Subset<T, User$orgNodesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrgChartPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly userId: FieldRef<"User", 'String'>
    readonly username: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly badgeNumber: FieldRef<"User", 'String'>
    readonly department: FieldRef<"User", 'String'>
    readonly isActive: FieldRef<"User", 'Boolean'>
    readonly lastLogin: FieldRef<"User", 'DateTime'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly createdBy: FieldRef<"User", 'String'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
    readonly updatedBy: FieldRef<"User", 'String'>
    readonly isDeleted: FieldRef<"User", 'Boolean'>
    readonly deletedAt: FieldRef<"User", 'DateTime'>
    readonly deletedBy: FieldRef<"User", 'String'>
    readonly roleId: FieldRef<"User", 'String'>
    readonly token: FieldRef<"User", 'String'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.creator
   */
  export type User$creatorArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * User.createdUsers
   */
  export type User$createdUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User.updater
   */
  export type User$updaterArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * User.updatedUsers
   */
  export type User$updatedUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User.deleter
   */
  export type User$deleterArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * User.deletedUsers
   */
  export type User$deletedUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User.createdRoles
   */
  export type User$createdRolesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
    where?: RoleWhereInput
    orderBy?: RoleOrderByWithRelationInput | RoleOrderByWithRelationInput[]
    cursor?: RoleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RoleScalarFieldEnum | RoleScalarFieldEnum[]
  }

  /**
   * User.updatedRoles
   */
  export type User$updatedRolesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
    where?: RoleWhereInput
    orderBy?: RoleOrderByWithRelationInput | RoleOrderByWithRelationInput[]
    cursor?: RoleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RoleScalarFieldEnum | RoleScalarFieldEnum[]
  }

  /**
   * User.deletedRoles
   */
  export type User$deletedRolesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
    where?: RoleWhereInput
    orderBy?: RoleOrderByWithRelationInput | RoleOrderByWithRelationInput[]
    cursor?: RoleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RoleScalarFieldEnum | RoleScalarFieldEnum[]
  }

  /**
   * User.orgNodes
   */
  export type User$orgNodesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgChart
     */
    select?: OrgChartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgChart
     */
    omit?: OrgChartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgChartInclude<ExtArgs> | null
    where?: OrgChartWhereInput
    orderBy?: OrgChartOrderByWithRelationInput | OrgChartOrderByWithRelationInput[]
    cursor?: OrgChartWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrgChartScalarFieldEnum | OrgChartScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model OrgStructure
   */

  export type AggregateOrgStructure = {
    _count: OrgStructureCountAggregateOutputType | null
    _min: OrgStructureMinAggregateOutputType | null
    _max: OrgStructureMaxAggregateOutputType | null
  }

  export type OrgStructureMinAggregateOutputType = {
    structureId: string | null
    name: string | null
    description: string | null
    rootNodeId: string | null
    createdAt: Date | null
    createdBy: string | null
    updatedAt: Date | null
    updatedBy: string | null
    isDeleted: boolean | null
    deletedAt: Date | null
    deletedBy: string | null
  }

  export type OrgStructureMaxAggregateOutputType = {
    structureId: string | null
    name: string | null
    description: string | null
    rootNodeId: string | null
    createdAt: Date | null
    createdBy: string | null
    updatedAt: Date | null
    updatedBy: string | null
    isDeleted: boolean | null
    deletedAt: Date | null
    deletedBy: string | null
  }

  export type OrgStructureCountAggregateOutputType = {
    structureId: number
    name: number
    description: number
    rootNodeId: number
    createdAt: number
    createdBy: number
    updatedAt: number
    updatedBy: number
    isDeleted: number
    deletedAt: number
    deletedBy: number
    _all: number
  }


  export type OrgStructureMinAggregateInputType = {
    structureId?: true
    name?: true
    description?: true
    rootNodeId?: true
    createdAt?: true
    createdBy?: true
    updatedAt?: true
    updatedBy?: true
    isDeleted?: true
    deletedAt?: true
    deletedBy?: true
  }

  export type OrgStructureMaxAggregateInputType = {
    structureId?: true
    name?: true
    description?: true
    rootNodeId?: true
    createdAt?: true
    createdBy?: true
    updatedAt?: true
    updatedBy?: true
    isDeleted?: true
    deletedAt?: true
    deletedBy?: true
  }

  export type OrgStructureCountAggregateInputType = {
    structureId?: true
    name?: true
    description?: true
    rootNodeId?: true
    createdAt?: true
    createdBy?: true
    updatedAt?: true
    updatedBy?: true
    isDeleted?: true
    deletedAt?: true
    deletedBy?: true
    _all?: true
  }

  export type OrgStructureAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrgStructure to aggregate.
     */
    where?: OrgStructureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrgStructures to fetch.
     */
    orderBy?: OrgStructureOrderByWithRelationInput | OrgStructureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrgStructureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrgStructures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrgStructures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OrgStructures
    **/
    _count?: true | OrgStructureCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrgStructureMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrgStructureMaxAggregateInputType
  }

  export type GetOrgStructureAggregateType<T extends OrgStructureAggregateArgs> = {
        [P in keyof T & keyof AggregateOrgStructure]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrgStructure[P]>
      : GetScalarType<T[P], AggregateOrgStructure[P]>
  }




  export type OrgStructureGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrgStructureWhereInput
    orderBy?: OrgStructureOrderByWithAggregationInput | OrgStructureOrderByWithAggregationInput[]
    by: OrgStructureScalarFieldEnum[] | OrgStructureScalarFieldEnum
    having?: OrgStructureScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrgStructureCountAggregateInputType | true
    _min?: OrgStructureMinAggregateInputType
    _max?: OrgStructureMaxAggregateInputType
  }

  export type OrgStructureGroupByOutputType = {
    structureId: string
    name: string
    description: string | null
    rootNodeId: string | null
    createdAt: Date
    createdBy: string | null
    updatedAt: Date
    updatedBy: string | null
    isDeleted: boolean
    deletedAt: Date | null
    deletedBy: string | null
    _count: OrgStructureCountAggregateOutputType | null
    _min: OrgStructureMinAggregateOutputType | null
    _max: OrgStructureMaxAggregateOutputType | null
  }

  type GetOrgStructureGroupByPayload<T extends OrgStructureGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrgStructureGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrgStructureGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrgStructureGroupByOutputType[P]>
            : GetScalarType<T[P], OrgStructureGroupByOutputType[P]>
        }
      >
    >


  export type OrgStructureSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    structureId?: boolean
    name?: boolean
    description?: boolean
    rootNodeId?: boolean
    createdAt?: boolean
    createdBy?: boolean
    updatedAt?: boolean
    updatedBy?: boolean
    isDeleted?: boolean
    deletedAt?: boolean
    deletedBy?: boolean
    nodes?: boolean | OrgStructure$nodesArgs<ExtArgs>
    _count?: boolean | OrgStructureCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["orgStructure"]>



  export type OrgStructureSelectScalar = {
    structureId?: boolean
    name?: boolean
    description?: boolean
    rootNodeId?: boolean
    createdAt?: boolean
    createdBy?: boolean
    updatedAt?: boolean
    updatedBy?: boolean
    isDeleted?: boolean
    deletedAt?: boolean
    deletedBy?: boolean
  }

  export type OrgStructureOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"structureId" | "name" | "description" | "rootNodeId" | "createdAt" | "createdBy" | "updatedAt" | "updatedBy" | "isDeleted" | "deletedAt" | "deletedBy", ExtArgs["result"]["orgStructure"]>
  export type OrgStructureInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    nodes?: boolean | OrgStructure$nodesArgs<ExtArgs>
    _count?: boolean | OrgStructureCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $OrgStructurePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OrgStructure"
    objects: {
      /**
       * relation -> many nodes
       */
      nodes: Prisma.$OrgChartPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      /**
       * e.g., "STR250101-0001"
       */
      structureId: string
      /**
       * contoh: "SBU CASTING", "INFRASTRUKTUR"
       */
      name: string
      description: string | null
      /**
       * optional: pointer to root node in org_chart
       */
      rootNodeId: string | null
      createdAt: Date
      createdBy: string | null
      updatedAt: Date
      updatedBy: string | null
      isDeleted: boolean
      deletedAt: Date | null
      deletedBy: string | null
    }, ExtArgs["result"]["orgStructure"]>
    composites: {}
  }

  type OrgStructureGetPayload<S extends boolean | null | undefined | OrgStructureDefaultArgs> = $Result.GetResult<Prisma.$OrgStructurePayload, S>

  type OrgStructureCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrgStructureFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrgStructureCountAggregateInputType | true
    }

  export interface OrgStructureDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OrgStructure'], meta: { name: 'OrgStructure' } }
    /**
     * Find zero or one OrgStructure that matches the filter.
     * @param {OrgStructureFindUniqueArgs} args - Arguments to find a OrgStructure
     * @example
     * // Get one OrgStructure
     * const orgStructure = await prisma.orgStructure.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrgStructureFindUniqueArgs>(args: SelectSubset<T, OrgStructureFindUniqueArgs<ExtArgs>>): Prisma__OrgStructureClient<$Result.GetResult<Prisma.$OrgStructurePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OrgStructure that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrgStructureFindUniqueOrThrowArgs} args - Arguments to find a OrgStructure
     * @example
     * // Get one OrgStructure
     * const orgStructure = await prisma.orgStructure.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrgStructureFindUniqueOrThrowArgs>(args: SelectSubset<T, OrgStructureFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrgStructureClient<$Result.GetResult<Prisma.$OrgStructurePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OrgStructure that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgStructureFindFirstArgs} args - Arguments to find a OrgStructure
     * @example
     * // Get one OrgStructure
     * const orgStructure = await prisma.orgStructure.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrgStructureFindFirstArgs>(args?: SelectSubset<T, OrgStructureFindFirstArgs<ExtArgs>>): Prisma__OrgStructureClient<$Result.GetResult<Prisma.$OrgStructurePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OrgStructure that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgStructureFindFirstOrThrowArgs} args - Arguments to find a OrgStructure
     * @example
     * // Get one OrgStructure
     * const orgStructure = await prisma.orgStructure.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrgStructureFindFirstOrThrowArgs>(args?: SelectSubset<T, OrgStructureFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrgStructureClient<$Result.GetResult<Prisma.$OrgStructurePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OrgStructures that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgStructureFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OrgStructures
     * const orgStructures = await prisma.orgStructure.findMany()
     * 
     * // Get first 10 OrgStructures
     * const orgStructures = await prisma.orgStructure.findMany({ take: 10 })
     * 
     * // Only select the `structureId`
     * const orgStructureWithStructureIdOnly = await prisma.orgStructure.findMany({ select: { structureId: true } })
     * 
     */
    findMany<T extends OrgStructureFindManyArgs>(args?: SelectSubset<T, OrgStructureFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrgStructurePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OrgStructure.
     * @param {OrgStructureCreateArgs} args - Arguments to create a OrgStructure.
     * @example
     * // Create one OrgStructure
     * const OrgStructure = await prisma.orgStructure.create({
     *   data: {
     *     // ... data to create a OrgStructure
     *   }
     * })
     * 
     */
    create<T extends OrgStructureCreateArgs>(args: SelectSubset<T, OrgStructureCreateArgs<ExtArgs>>): Prisma__OrgStructureClient<$Result.GetResult<Prisma.$OrgStructurePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OrgStructures.
     * @param {OrgStructureCreateManyArgs} args - Arguments to create many OrgStructures.
     * @example
     * // Create many OrgStructures
     * const orgStructure = await prisma.orgStructure.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrgStructureCreateManyArgs>(args?: SelectSubset<T, OrgStructureCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a OrgStructure.
     * @param {OrgStructureDeleteArgs} args - Arguments to delete one OrgStructure.
     * @example
     * // Delete one OrgStructure
     * const OrgStructure = await prisma.orgStructure.delete({
     *   where: {
     *     // ... filter to delete one OrgStructure
     *   }
     * })
     * 
     */
    delete<T extends OrgStructureDeleteArgs>(args: SelectSubset<T, OrgStructureDeleteArgs<ExtArgs>>): Prisma__OrgStructureClient<$Result.GetResult<Prisma.$OrgStructurePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OrgStructure.
     * @param {OrgStructureUpdateArgs} args - Arguments to update one OrgStructure.
     * @example
     * // Update one OrgStructure
     * const orgStructure = await prisma.orgStructure.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrgStructureUpdateArgs>(args: SelectSubset<T, OrgStructureUpdateArgs<ExtArgs>>): Prisma__OrgStructureClient<$Result.GetResult<Prisma.$OrgStructurePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OrgStructures.
     * @param {OrgStructureDeleteManyArgs} args - Arguments to filter OrgStructures to delete.
     * @example
     * // Delete a few OrgStructures
     * const { count } = await prisma.orgStructure.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrgStructureDeleteManyArgs>(args?: SelectSubset<T, OrgStructureDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrgStructures.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgStructureUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OrgStructures
     * const orgStructure = await prisma.orgStructure.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrgStructureUpdateManyArgs>(args: SelectSubset<T, OrgStructureUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one OrgStructure.
     * @param {OrgStructureUpsertArgs} args - Arguments to update or create a OrgStructure.
     * @example
     * // Update or create a OrgStructure
     * const orgStructure = await prisma.orgStructure.upsert({
     *   create: {
     *     // ... data to create a OrgStructure
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OrgStructure we want to update
     *   }
     * })
     */
    upsert<T extends OrgStructureUpsertArgs>(args: SelectSubset<T, OrgStructureUpsertArgs<ExtArgs>>): Prisma__OrgStructureClient<$Result.GetResult<Prisma.$OrgStructurePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OrgStructures.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgStructureCountArgs} args - Arguments to filter OrgStructures to count.
     * @example
     * // Count the number of OrgStructures
     * const count = await prisma.orgStructure.count({
     *   where: {
     *     // ... the filter for the OrgStructures we want to count
     *   }
     * })
    **/
    count<T extends OrgStructureCountArgs>(
      args?: Subset<T, OrgStructureCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrgStructureCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OrgStructure.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgStructureAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OrgStructureAggregateArgs>(args: Subset<T, OrgStructureAggregateArgs>): Prisma.PrismaPromise<GetOrgStructureAggregateType<T>>

    /**
     * Group by OrgStructure.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgStructureGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OrgStructureGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrgStructureGroupByArgs['orderBy'] }
        : { orderBy?: OrgStructureGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OrgStructureGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrgStructureGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OrgStructure model
   */
  readonly fields: OrgStructureFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OrgStructure.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrgStructureClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    nodes<T extends OrgStructure$nodesArgs<ExtArgs> = {}>(args?: Subset<T, OrgStructure$nodesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrgChartPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OrgStructure model
   */
  interface OrgStructureFieldRefs {
    readonly structureId: FieldRef<"OrgStructure", 'String'>
    readonly name: FieldRef<"OrgStructure", 'String'>
    readonly description: FieldRef<"OrgStructure", 'String'>
    readonly rootNodeId: FieldRef<"OrgStructure", 'String'>
    readonly createdAt: FieldRef<"OrgStructure", 'DateTime'>
    readonly createdBy: FieldRef<"OrgStructure", 'String'>
    readonly updatedAt: FieldRef<"OrgStructure", 'DateTime'>
    readonly updatedBy: FieldRef<"OrgStructure", 'String'>
    readonly isDeleted: FieldRef<"OrgStructure", 'Boolean'>
    readonly deletedAt: FieldRef<"OrgStructure", 'DateTime'>
    readonly deletedBy: FieldRef<"OrgStructure", 'String'>
  }
    

  // Custom InputTypes
  /**
   * OrgStructure findUnique
   */
  export type OrgStructureFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgStructure
     */
    select?: OrgStructureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgStructure
     */
    omit?: OrgStructureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgStructureInclude<ExtArgs> | null
    /**
     * Filter, which OrgStructure to fetch.
     */
    where: OrgStructureWhereUniqueInput
  }

  /**
   * OrgStructure findUniqueOrThrow
   */
  export type OrgStructureFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgStructure
     */
    select?: OrgStructureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgStructure
     */
    omit?: OrgStructureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgStructureInclude<ExtArgs> | null
    /**
     * Filter, which OrgStructure to fetch.
     */
    where: OrgStructureWhereUniqueInput
  }

  /**
   * OrgStructure findFirst
   */
  export type OrgStructureFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgStructure
     */
    select?: OrgStructureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgStructure
     */
    omit?: OrgStructureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgStructureInclude<ExtArgs> | null
    /**
     * Filter, which OrgStructure to fetch.
     */
    where?: OrgStructureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrgStructures to fetch.
     */
    orderBy?: OrgStructureOrderByWithRelationInput | OrgStructureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrgStructures.
     */
    cursor?: OrgStructureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrgStructures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrgStructures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrgStructures.
     */
    distinct?: OrgStructureScalarFieldEnum | OrgStructureScalarFieldEnum[]
  }

  /**
   * OrgStructure findFirstOrThrow
   */
  export type OrgStructureFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgStructure
     */
    select?: OrgStructureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgStructure
     */
    omit?: OrgStructureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgStructureInclude<ExtArgs> | null
    /**
     * Filter, which OrgStructure to fetch.
     */
    where?: OrgStructureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrgStructures to fetch.
     */
    orderBy?: OrgStructureOrderByWithRelationInput | OrgStructureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrgStructures.
     */
    cursor?: OrgStructureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrgStructures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrgStructures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrgStructures.
     */
    distinct?: OrgStructureScalarFieldEnum | OrgStructureScalarFieldEnum[]
  }

  /**
   * OrgStructure findMany
   */
  export type OrgStructureFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgStructure
     */
    select?: OrgStructureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgStructure
     */
    omit?: OrgStructureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgStructureInclude<ExtArgs> | null
    /**
     * Filter, which OrgStructures to fetch.
     */
    where?: OrgStructureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrgStructures to fetch.
     */
    orderBy?: OrgStructureOrderByWithRelationInput | OrgStructureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OrgStructures.
     */
    cursor?: OrgStructureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrgStructures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrgStructures.
     */
    skip?: number
    distinct?: OrgStructureScalarFieldEnum | OrgStructureScalarFieldEnum[]
  }

  /**
   * OrgStructure create
   */
  export type OrgStructureCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgStructure
     */
    select?: OrgStructureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgStructure
     */
    omit?: OrgStructureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgStructureInclude<ExtArgs> | null
    /**
     * The data needed to create a OrgStructure.
     */
    data: XOR<OrgStructureCreateInput, OrgStructureUncheckedCreateInput>
  }

  /**
   * OrgStructure createMany
   */
  export type OrgStructureCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OrgStructures.
     */
    data: OrgStructureCreateManyInput | OrgStructureCreateManyInput[]
  }

  /**
   * OrgStructure update
   */
  export type OrgStructureUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgStructure
     */
    select?: OrgStructureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgStructure
     */
    omit?: OrgStructureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgStructureInclude<ExtArgs> | null
    /**
     * The data needed to update a OrgStructure.
     */
    data: XOR<OrgStructureUpdateInput, OrgStructureUncheckedUpdateInput>
    /**
     * Choose, which OrgStructure to update.
     */
    where: OrgStructureWhereUniqueInput
  }

  /**
   * OrgStructure updateMany
   */
  export type OrgStructureUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OrgStructures.
     */
    data: XOR<OrgStructureUpdateManyMutationInput, OrgStructureUncheckedUpdateManyInput>
    /**
     * Filter which OrgStructures to update
     */
    where?: OrgStructureWhereInput
    /**
     * Limit how many OrgStructures to update.
     */
    limit?: number
  }

  /**
   * OrgStructure upsert
   */
  export type OrgStructureUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgStructure
     */
    select?: OrgStructureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgStructure
     */
    omit?: OrgStructureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgStructureInclude<ExtArgs> | null
    /**
     * The filter to search for the OrgStructure to update in case it exists.
     */
    where: OrgStructureWhereUniqueInput
    /**
     * In case the OrgStructure found by the `where` argument doesn't exist, create a new OrgStructure with this data.
     */
    create: XOR<OrgStructureCreateInput, OrgStructureUncheckedCreateInput>
    /**
     * In case the OrgStructure was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrgStructureUpdateInput, OrgStructureUncheckedUpdateInput>
  }

  /**
   * OrgStructure delete
   */
  export type OrgStructureDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgStructure
     */
    select?: OrgStructureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgStructure
     */
    omit?: OrgStructureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgStructureInclude<ExtArgs> | null
    /**
     * Filter which OrgStructure to delete.
     */
    where: OrgStructureWhereUniqueInput
  }

  /**
   * OrgStructure deleteMany
   */
  export type OrgStructureDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrgStructures to delete
     */
    where?: OrgStructureWhereInput
    /**
     * Limit how many OrgStructures to delete.
     */
    limit?: number
  }

  /**
   * OrgStructure.nodes
   */
  export type OrgStructure$nodesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgChart
     */
    select?: OrgChartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgChart
     */
    omit?: OrgChartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgChartInclude<ExtArgs> | null
    where?: OrgChartWhereInput
    orderBy?: OrgChartOrderByWithRelationInput | OrgChartOrderByWithRelationInput[]
    cursor?: OrgChartWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrgChartScalarFieldEnum | OrgChartScalarFieldEnum[]
  }

  /**
   * OrgStructure without action
   */
  export type OrgStructureDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgStructure
     */
    select?: OrgStructureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgStructure
     */
    omit?: OrgStructureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgStructureInclude<ExtArgs> | null
  }


  /**
   * Model OrgChart
   */

  export type AggregateOrgChart = {
    _count: OrgChartCountAggregateOutputType | null
    _avg: OrgChartAvgAggregateOutputType | null
    _sum: OrgChartSumAggregateOutputType | null
    _min: OrgChartMinAggregateOutputType | null
    _max: OrgChartMaxAggregateOutputType | null
  }

  export type OrgChartAvgAggregateOutputType = {
    orderIndex: number | null
  }

  export type OrgChartSumAggregateOutputType = {
    orderIndex: number | null
  }

  export type OrgChartMinAggregateOutputType = {
    nodeId: string | null
    structureId: string | null
    userId: string | null
    parentId: string | null
    name: string | null
    position: string | null
    orderIndex: number | null
    createdAt: Date | null
    createdBy: string | null
    updatedAt: Date | null
    updatedBy: string | null
    isDeleted: boolean | null
    deletedAt: Date | null
    deletedBy: string | null
  }

  export type OrgChartMaxAggregateOutputType = {
    nodeId: string | null
    structureId: string | null
    userId: string | null
    parentId: string | null
    name: string | null
    position: string | null
    orderIndex: number | null
    createdAt: Date | null
    createdBy: string | null
    updatedAt: Date | null
    updatedBy: string | null
    isDeleted: boolean | null
    deletedAt: Date | null
    deletedBy: string | null
  }

  export type OrgChartCountAggregateOutputType = {
    nodeId: number
    structureId: number
    userId: number
    parentId: number
    name: number
    position: number
    orderIndex: number
    createdAt: number
    createdBy: number
    updatedAt: number
    updatedBy: number
    isDeleted: number
    deletedAt: number
    deletedBy: number
    _all: number
  }


  export type OrgChartAvgAggregateInputType = {
    orderIndex?: true
  }

  export type OrgChartSumAggregateInputType = {
    orderIndex?: true
  }

  export type OrgChartMinAggregateInputType = {
    nodeId?: true
    structureId?: true
    userId?: true
    parentId?: true
    name?: true
    position?: true
    orderIndex?: true
    createdAt?: true
    createdBy?: true
    updatedAt?: true
    updatedBy?: true
    isDeleted?: true
    deletedAt?: true
    deletedBy?: true
  }

  export type OrgChartMaxAggregateInputType = {
    nodeId?: true
    structureId?: true
    userId?: true
    parentId?: true
    name?: true
    position?: true
    orderIndex?: true
    createdAt?: true
    createdBy?: true
    updatedAt?: true
    updatedBy?: true
    isDeleted?: true
    deletedAt?: true
    deletedBy?: true
  }

  export type OrgChartCountAggregateInputType = {
    nodeId?: true
    structureId?: true
    userId?: true
    parentId?: true
    name?: true
    position?: true
    orderIndex?: true
    createdAt?: true
    createdBy?: true
    updatedAt?: true
    updatedBy?: true
    isDeleted?: true
    deletedAt?: true
    deletedBy?: true
    _all?: true
  }

  export type OrgChartAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrgChart to aggregate.
     */
    where?: OrgChartWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrgCharts to fetch.
     */
    orderBy?: OrgChartOrderByWithRelationInput | OrgChartOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrgChartWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrgCharts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrgCharts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OrgCharts
    **/
    _count?: true | OrgChartCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OrgChartAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OrgChartSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrgChartMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrgChartMaxAggregateInputType
  }

  export type GetOrgChartAggregateType<T extends OrgChartAggregateArgs> = {
        [P in keyof T & keyof AggregateOrgChart]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrgChart[P]>
      : GetScalarType<T[P], AggregateOrgChart[P]>
  }




  export type OrgChartGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrgChartWhereInput
    orderBy?: OrgChartOrderByWithAggregationInput | OrgChartOrderByWithAggregationInput[]
    by: OrgChartScalarFieldEnum[] | OrgChartScalarFieldEnum
    having?: OrgChartScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrgChartCountAggregateInputType | true
    _avg?: OrgChartAvgAggregateInputType
    _sum?: OrgChartSumAggregateInputType
    _min?: OrgChartMinAggregateInputType
    _max?: OrgChartMaxAggregateInputType
  }

  export type OrgChartGroupByOutputType = {
    nodeId: string
    structureId: string
    userId: string | null
    parentId: string | null
    name: string | null
    position: string
    orderIndex: number
    createdAt: Date
    createdBy: string | null
    updatedAt: Date
    updatedBy: string | null
    isDeleted: boolean
    deletedAt: Date | null
    deletedBy: string | null
    _count: OrgChartCountAggregateOutputType | null
    _avg: OrgChartAvgAggregateOutputType | null
    _sum: OrgChartSumAggregateOutputType | null
    _min: OrgChartMinAggregateOutputType | null
    _max: OrgChartMaxAggregateOutputType | null
  }

  type GetOrgChartGroupByPayload<T extends OrgChartGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrgChartGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrgChartGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrgChartGroupByOutputType[P]>
            : GetScalarType<T[P], OrgChartGroupByOutputType[P]>
        }
      >
    >


  export type OrgChartSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    nodeId?: boolean
    structureId?: boolean
    userId?: boolean
    parentId?: boolean
    name?: boolean
    position?: boolean
    orderIndex?: boolean
    createdAt?: boolean
    createdBy?: boolean
    updatedAt?: boolean
    updatedBy?: boolean
    isDeleted?: boolean
    deletedAt?: boolean
    deletedBy?: boolean
    parent?: boolean | OrgChart$parentArgs<ExtArgs>
    children?: boolean | OrgChart$childrenArgs<ExtArgs>
    user?: boolean | OrgChart$userArgs<ExtArgs>
    structure?: boolean | OrgStructureDefaultArgs<ExtArgs>
    _count?: boolean | OrgChartCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["orgChart"]>



  export type OrgChartSelectScalar = {
    nodeId?: boolean
    structureId?: boolean
    userId?: boolean
    parentId?: boolean
    name?: boolean
    position?: boolean
    orderIndex?: boolean
    createdAt?: boolean
    createdBy?: boolean
    updatedAt?: boolean
    updatedBy?: boolean
    isDeleted?: boolean
    deletedAt?: boolean
    deletedBy?: boolean
  }

  export type OrgChartOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"nodeId" | "structureId" | "userId" | "parentId" | "name" | "position" | "orderIndex" | "createdAt" | "createdBy" | "updatedAt" | "updatedBy" | "isDeleted" | "deletedAt" | "deletedBy", ExtArgs["result"]["orgChart"]>
  export type OrgChartInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    parent?: boolean | OrgChart$parentArgs<ExtArgs>
    children?: boolean | OrgChart$childrenArgs<ExtArgs>
    user?: boolean | OrgChart$userArgs<ExtArgs>
    structure?: boolean | OrgStructureDefaultArgs<ExtArgs>
    _count?: boolean | OrgChartCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $OrgChartPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OrgChart"
    objects: {
      /**
       * self reference (parent)
       */
      parent: Prisma.$OrgChartPayload<ExtArgs> | null
      children: Prisma.$OrgChartPayload<ExtArgs>[]
      /**
       * Relation ke User
       */
      user: Prisma.$UserPayload<ExtArgs> | null
      structure: Prisma.$OrgStructurePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      /**
       * e.g., "NODE251120-0001"
       */
      nodeId: string
      structureId: string
      userId: string | null
      /**
       * NULL = posisi teratas (presiden)
       */
      parentId: string | null
      name: string | null
      position: string
      /**
       * urutan dalam satu level
       */
      orderIndex: number
      createdAt: Date
      createdBy: string | null
      updatedAt: Date
      updatedBy: string | null
      isDeleted: boolean
      deletedAt: Date | null
      deletedBy: string | null
    }, ExtArgs["result"]["orgChart"]>
    composites: {}
  }

  type OrgChartGetPayload<S extends boolean | null | undefined | OrgChartDefaultArgs> = $Result.GetResult<Prisma.$OrgChartPayload, S>

  type OrgChartCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrgChartFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrgChartCountAggregateInputType | true
    }

  export interface OrgChartDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OrgChart'], meta: { name: 'OrgChart' } }
    /**
     * Find zero or one OrgChart that matches the filter.
     * @param {OrgChartFindUniqueArgs} args - Arguments to find a OrgChart
     * @example
     * // Get one OrgChart
     * const orgChart = await prisma.orgChart.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrgChartFindUniqueArgs>(args: SelectSubset<T, OrgChartFindUniqueArgs<ExtArgs>>): Prisma__OrgChartClient<$Result.GetResult<Prisma.$OrgChartPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OrgChart that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrgChartFindUniqueOrThrowArgs} args - Arguments to find a OrgChart
     * @example
     * // Get one OrgChart
     * const orgChart = await prisma.orgChart.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrgChartFindUniqueOrThrowArgs>(args: SelectSubset<T, OrgChartFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrgChartClient<$Result.GetResult<Prisma.$OrgChartPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OrgChart that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgChartFindFirstArgs} args - Arguments to find a OrgChart
     * @example
     * // Get one OrgChart
     * const orgChart = await prisma.orgChart.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrgChartFindFirstArgs>(args?: SelectSubset<T, OrgChartFindFirstArgs<ExtArgs>>): Prisma__OrgChartClient<$Result.GetResult<Prisma.$OrgChartPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OrgChart that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgChartFindFirstOrThrowArgs} args - Arguments to find a OrgChart
     * @example
     * // Get one OrgChart
     * const orgChart = await prisma.orgChart.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrgChartFindFirstOrThrowArgs>(args?: SelectSubset<T, OrgChartFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrgChartClient<$Result.GetResult<Prisma.$OrgChartPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OrgCharts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgChartFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OrgCharts
     * const orgCharts = await prisma.orgChart.findMany()
     * 
     * // Get first 10 OrgCharts
     * const orgCharts = await prisma.orgChart.findMany({ take: 10 })
     * 
     * // Only select the `nodeId`
     * const orgChartWithNodeIdOnly = await prisma.orgChart.findMany({ select: { nodeId: true } })
     * 
     */
    findMany<T extends OrgChartFindManyArgs>(args?: SelectSubset<T, OrgChartFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrgChartPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OrgChart.
     * @param {OrgChartCreateArgs} args - Arguments to create a OrgChart.
     * @example
     * // Create one OrgChart
     * const OrgChart = await prisma.orgChart.create({
     *   data: {
     *     // ... data to create a OrgChart
     *   }
     * })
     * 
     */
    create<T extends OrgChartCreateArgs>(args: SelectSubset<T, OrgChartCreateArgs<ExtArgs>>): Prisma__OrgChartClient<$Result.GetResult<Prisma.$OrgChartPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OrgCharts.
     * @param {OrgChartCreateManyArgs} args - Arguments to create many OrgCharts.
     * @example
     * // Create many OrgCharts
     * const orgChart = await prisma.orgChart.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrgChartCreateManyArgs>(args?: SelectSubset<T, OrgChartCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a OrgChart.
     * @param {OrgChartDeleteArgs} args - Arguments to delete one OrgChart.
     * @example
     * // Delete one OrgChart
     * const OrgChart = await prisma.orgChart.delete({
     *   where: {
     *     // ... filter to delete one OrgChart
     *   }
     * })
     * 
     */
    delete<T extends OrgChartDeleteArgs>(args: SelectSubset<T, OrgChartDeleteArgs<ExtArgs>>): Prisma__OrgChartClient<$Result.GetResult<Prisma.$OrgChartPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OrgChart.
     * @param {OrgChartUpdateArgs} args - Arguments to update one OrgChart.
     * @example
     * // Update one OrgChart
     * const orgChart = await prisma.orgChart.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrgChartUpdateArgs>(args: SelectSubset<T, OrgChartUpdateArgs<ExtArgs>>): Prisma__OrgChartClient<$Result.GetResult<Prisma.$OrgChartPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OrgCharts.
     * @param {OrgChartDeleteManyArgs} args - Arguments to filter OrgCharts to delete.
     * @example
     * // Delete a few OrgCharts
     * const { count } = await prisma.orgChart.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrgChartDeleteManyArgs>(args?: SelectSubset<T, OrgChartDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrgCharts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgChartUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OrgCharts
     * const orgChart = await prisma.orgChart.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrgChartUpdateManyArgs>(args: SelectSubset<T, OrgChartUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one OrgChart.
     * @param {OrgChartUpsertArgs} args - Arguments to update or create a OrgChart.
     * @example
     * // Update or create a OrgChart
     * const orgChart = await prisma.orgChart.upsert({
     *   create: {
     *     // ... data to create a OrgChart
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OrgChart we want to update
     *   }
     * })
     */
    upsert<T extends OrgChartUpsertArgs>(args: SelectSubset<T, OrgChartUpsertArgs<ExtArgs>>): Prisma__OrgChartClient<$Result.GetResult<Prisma.$OrgChartPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OrgCharts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgChartCountArgs} args - Arguments to filter OrgCharts to count.
     * @example
     * // Count the number of OrgCharts
     * const count = await prisma.orgChart.count({
     *   where: {
     *     // ... the filter for the OrgCharts we want to count
     *   }
     * })
    **/
    count<T extends OrgChartCountArgs>(
      args?: Subset<T, OrgChartCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrgChartCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OrgChart.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgChartAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OrgChartAggregateArgs>(args: Subset<T, OrgChartAggregateArgs>): Prisma.PrismaPromise<GetOrgChartAggregateType<T>>

    /**
     * Group by OrgChart.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgChartGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OrgChartGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrgChartGroupByArgs['orderBy'] }
        : { orderBy?: OrgChartGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OrgChartGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrgChartGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OrgChart model
   */
  readonly fields: OrgChartFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OrgChart.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrgChartClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    parent<T extends OrgChart$parentArgs<ExtArgs> = {}>(args?: Subset<T, OrgChart$parentArgs<ExtArgs>>): Prisma__OrgChartClient<$Result.GetResult<Prisma.$OrgChartPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    children<T extends OrgChart$childrenArgs<ExtArgs> = {}>(args?: Subset<T, OrgChart$childrenArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrgChartPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    user<T extends OrgChart$userArgs<ExtArgs> = {}>(args?: Subset<T, OrgChart$userArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    structure<T extends OrgStructureDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrgStructureDefaultArgs<ExtArgs>>): Prisma__OrgStructureClient<$Result.GetResult<Prisma.$OrgStructurePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OrgChart model
   */
  interface OrgChartFieldRefs {
    readonly nodeId: FieldRef<"OrgChart", 'String'>
    readonly structureId: FieldRef<"OrgChart", 'String'>
    readonly userId: FieldRef<"OrgChart", 'String'>
    readonly parentId: FieldRef<"OrgChart", 'String'>
    readonly name: FieldRef<"OrgChart", 'String'>
    readonly position: FieldRef<"OrgChart", 'String'>
    readonly orderIndex: FieldRef<"OrgChart", 'Int'>
    readonly createdAt: FieldRef<"OrgChart", 'DateTime'>
    readonly createdBy: FieldRef<"OrgChart", 'String'>
    readonly updatedAt: FieldRef<"OrgChart", 'DateTime'>
    readonly updatedBy: FieldRef<"OrgChart", 'String'>
    readonly isDeleted: FieldRef<"OrgChart", 'Boolean'>
    readonly deletedAt: FieldRef<"OrgChart", 'DateTime'>
    readonly deletedBy: FieldRef<"OrgChart", 'String'>
  }
    

  // Custom InputTypes
  /**
   * OrgChart findUnique
   */
  export type OrgChartFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgChart
     */
    select?: OrgChartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgChart
     */
    omit?: OrgChartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgChartInclude<ExtArgs> | null
    /**
     * Filter, which OrgChart to fetch.
     */
    where: OrgChartWhereUniqueInput
  }

  /**
   * OrgChart findUniqueOrThrow
   */
  export type OrgChartFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgChart
     */
    select?: OrgChartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgChart
     */
    omit?: OrgChartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgChartInclude<ExtArgs> | null
    /**
     * Filter, which OrgChart to fetch.
     */
    where: OrgChartWhereUniqueInput
  }

  /**
   * OrgChart findFirst
   */
  export type OrgChartFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgChart
     */
    select?: OrgChartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgChart
     */
    omit?: OrgChartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgChartInclude<ExtArgs> | null
    /**
     * Filter, which OrgChart to fetch.
     */
    where?: OrgChartWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrgCharts to fetch.
     */
    orderBy?: OrgChartOrderByWithRelationInput | OrgChartOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrgCharts.
     */
    cursor?: OrgChartWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrgCharts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrgCharts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrgCharts.
     */
    distinct?: OrgChartScalarFieldEnum | OrgChartScalarFieldEnum[]
  }

  /**
   * OrgChart findFirstOrThrow
   */
  export type OrgChartFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgChart
     */
    select?: OrgChartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgChart
     */
    omit?: OrgChartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgChartInclude<ExtArgs> | null
    /**
     * Filter, which OrgChart to fetch.
     */
    where?: OrgChartWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrgCharts to fetch.
     */
    orderBy?: OrgChartOrderByWithRelationInput | OrgChartOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrgCharts.
     */
    cursor?: OrgChartWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrgCharts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrgCharts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrgCharts.
     */
    distinct?: OrgChartScalarFieldEnum | OrgChartScalarFieldEnum[]
  }

  /**
   * OrgChart findMany
   */
  export type OrgChartFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgChart
     */
    select?: OrgChartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgChart
     */
    omit?: OrgChartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgChartInclude<ExtArgs> | null
    /**
     * Filter, which OrgCharts to fetch.
     */
    where?: OrgChartWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrgCharts to fetch.
     */
    orderBy?: OrgChartOrderByWithRelationInput | OrgChartOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OrgCharts.
     */
    cursor?: OrgChartWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrgCharts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrgCharts.
     */
    skip?: number
    distinct?: OrgChartScalarFieldEnum | OrgChartScalarFieldEnum[]
  }

  /**
   * OrgChart create
   */
  export type OrgChartCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgChart
     */
    select?: OrgChartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgChart
     */
    omit?: OrgChartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgChartInclude<ExtArgs> | null
    /**
     * The data needed to create a OrgChart.
     */
    data: XOR<OrgChartCreateInput, OrgChartUncheckedCreateInput>
  }

  /**
   * OrgChart createMany
   */
  export type OrgChartCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OrgCharts.
     */
    data: OrgChartCreateManyInput | OrgChartCreateManyInput[]
  }

  /**
   * OrgChart update
   */
  export type OrgChartUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgChart
     */
    select?: OrgChartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgChart
     */
    omit?: OrgChartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgChartInclude<ExtArgs> | null
    /**
     * The data needed to update a OrgChart.
     */
    data: XOR<OrgChartUpdateInput, OrgChartUncheckedUpdateInput>
    /**
     * Choose, which OrgChart to update.
     */
    where: OrgChartWhereUniqueInput
  }

  /**
   * OrgChart updateMany
   */
  export type OrgChartUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OrgCharts.
     */
    data: XOR<OrgChartUpdateManyMutationInput, OrgChartUncheckedUpdateManyInput>
    /**
     * Filter which OrgCharts to update
     */
    where?: OrgChartWhereInput
    /**
     * Limit how many OrgCharts to update.
     */
    limit?: number
  }

  /**
   * OrgChart upsert
   */
  export type OrgChartUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgChart
     */
    select?: OrgChartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgChart
     */
    omit?: OrgChartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgChartInclude<ExtArgs> | null
    /**
     * The filter to search for the OrgChart to update in case it exists.
     */
    where: OrgChartWhereUniqueInput
    /**
     * In case the OrgChart found by the `where` argument doesn't exist, create a new OrgChart with this data.
     */
    create: XOR<OrgChartCreateInput, OrgChartUncheckedCreateInput>
    /**
     * In case the OrgChart was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrgChartUpdateInput, OrgChartUncheckedUpdateInput>
  }

  /**
   * OrgChart delete
   */
  export type OrgChartDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgChart
     */
    select?: OrgChartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgChart
     */
    omit?: OrgChartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgChartInclude<ExtArgs> | null
    /**
     * Filter which OrgChart to delete.
     */
    where: OrgChartWhereUniqueInput
  }

  /**
   * OrgChart deleteMany
   */
  export type OrgChartDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrgCharts to delete
     */
    where?: OrgChartWhereInput
    /**
     * Limit how many OrgCharts to delete.
     */
    limit?: number
  }

  /**
   * OrgChart.parent
   */
  export type OrgChart$parentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgChart
     */
    select?: OrgChartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgChart
     */
    omit?: OrgChartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgChartInclude<ExtArgs> | null
    where?: OrgChartWhereInput
  }

  /**
   * OrgChart.children
   */
  export type OrgChart$childrenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgChart
     */
    select?: OrgChartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgChart
     */
    omit?: OrgChartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgChartInclude<ExtArgs> | null
    where?: OrgChartWhereInput
    orderBy?: OrgChartOrderByWithRelationInput | OrgChartOrderByWithRelationInput[]
    cursor?: OrgChartWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrgChartScalarFieldEnum | OrgChartScalarFieldEnum[]
  }

  /**
   * OrgChart.user
   */
  export type OrgChart$userArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * OrgChart without action
   */
  export type OrgChartDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgChart
     */
    select?: OrgChartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgChart
     */
    omit?: OrgChartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgChartInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable',
    Snapshot: 'Snapshot'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const RoleScalarFieldEnum: {
    roleId: 'roleId',
    roleName: 'roleName',
    roleLevel: 'roleLevel',
    roleDesc: 'roleDesc',
    roleIsActive: 'roleIsActive',
    createdAt: 'createdAt',
    createdBy: 'createdBy',
    updatedAt: 'updatedAt',
    updatedBy: 'updatedBy',
    isDeleted: 'isDeleted',
    deletedAt: 'deletedAt',
    deletedBy: 'deletedBy'
  };

  export type RoleScalarFieldEnum = (typeof RoleScalarFieldEnum)[keyof typeof RoleScalarFieldEnum]


  export const UserScalarFieldEnum: {
    userId: 'userId',
    username: 'username',
    password: 'password',
    name: 'name',
    badgeNumber: 'badgeNumber',
    department: 'department',
    isActive: 'isActive',
    lastLogin: 'lastLogin',
    createdAt: 'createdAt',
    createdBy: 'createdBy',
    updatedAt: 'updatedAt',
    updatedBy: 'updatedBy',
    isDeleted: 'isDeleted',
    deletedAt: 'deletedAt',
    deletedBy: 'deletedBy',
    roleId: 'roleId',
    token: 'token'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const OrgStructureScalarFieldEnum: {
    structureId: 'structureId',
    name: 'name',
    description: 'description',
    rootNodeId: 'rootNodeId',
    createdAt: 'createdAt',
    createdBy: 'createdBy',
    updatedAt: 'updatedAt',
    updatedBy: 'updatedBy',
    isDeleted: 'isDeleted',
    deletedAt: 'deletedAt',
    deletedBy: 'deletedBy'
  };

  export type OrgStructureScalarFieldEnum = (typeof OrgStructureScalarFieldEnum)[keyof typeof OrgStructureScalarFieldEnum]


  export const OrgChartScalarFieldEnum: {
    nodeId: 'nodeId',
    structureId: 'structureId',
    userId: 'userId',
    parentId: 'parentId',
    name: 'name',
    position: 'position',
    orderIndex: 'orderIndex',
    createdAt: 'createdAt',
    createdBy: 'createdBy',
    updatedAt: 'updatedAt',
    updatedBy: 'updatedBy',
    isDeleted: 'isDeleted',
    deletedAt: 'deletedAt',
    deletedBy: 'deletedBy'
  };

  export type OrgChartScalarFieldEnum = (typeof OrgChartScalarFieldEnum)[keyof typeof OrgChartScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type RoleWhereInput = {
    AND?: RoleWhereInput | RoleWhereInput[]
    OR?: RoleWhereInput[]
    NOT?: RoleWhereInput | RoleWhereInput[]
    roleId?: StringFilter<"Role"> | string
    roleName?: StringFilter<"Role"> | string
    roleLevel?: IntFilter<"Role"> | number
    roleDesc?: StringNullableFilter<"Role"> | string | null
    roleIsActive?: BoolFilter<"Role"> | boolean
    createdAt?: DateTimeFilter<"Role"> | Date | string
    createdBy?: StringNullableFilter<"Role"> | string | null
    updatedAt?: DateTimeFilter<"Role"> | Date | string
    updatedBy?: StringNullableFilter<"Role"> | string | null
    isDeleted?: BoolFilter<"Role"> | boolean
    deletedAt?: DateTimeNullableFilter<"Role"> | Date | string | null
    deletedBy?: StringNullableFilter<"Role"> | string | null
    creator?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    updater?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    deleter?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    users?: UserListRelationFilter
  }

  export type RoleOrderByWithRelationInput = {
    roleId?: SortOrder
    roleName?: SortOrder
    roleLevel?: SortOrder
    roleDesc?: SortOrderInput | SortOrder
    roleIsActive?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrderInput | SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    deletedBy?: SortOrderInput | SortOrder
    creator?: UserOrderByWithRelationInput
    updater?: UserOrderByWithRelationInput
    deleter?: UserOrderByWithRelationInput
    users?: UserOrderByRelationAggregateInput
  }

  export type RoleWhereUniqueInput = Prisma.AtLeast<{
    roleId?: string
    AND?: RoleWhereInput | RoleWhereInput[]
    OR?: RoleWhereInput[]
    NOT?: RoleWhereInput | RoleWhereInput[]
    roleName?: StringFilter<"Role"> | string
    roleLevel?: IntFilter<"Role"> | number
    roleDesc?: StringNullableFilter<"Role"> | string | null
    roleIsActive?: BoolFilter<"Role"> | boolean
    createdAt?: DateTimeFilter<"Role"> | Date | string
    createdBy?: StringNullableFilter<"Role"> | string | null
    updatedAt?: DateTimeFilter<"Role"> | Date | string
    updatedBy?: StringNullableFilter<"Role"> | string | null
    isDeleted?: BoolFilter<"Role"> | boolean
    deletedAt?: DateTimeNullableFilter<"Role"> | Date | string | null
    deletedBy?: StringNullableFilter<"Role"> | string | null
    creator?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    updater?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    deleter?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    users?: UserListRelationFilter
  }, "roleId">

  export type RoleOrderByWithAggregationInput = {
    roleId?: SortOrder
    roleName?: SortOrder
    roleLevel?: SortOrder
    roleDesc?: SortOrderInput | SortOrder
    roleIsActive?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrderInput | SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    deletedBy?: SortOrderInput | SortOrder
    _count?: RoleCountOrderByAggregateInput
    _avg?: RoleAvgOrderByAggregateInput
    _max?: RoleMaxOrderByAggregateInput
    _min?: RoleMinOrderByAggregateInput
    _sum?: RoleSumOrderByAggregateInput
  }

  export type RoleScalarWhereWithAggregatesInput = {
    AND?: RoleScalarWhereWithAggregatesInput | RoleScalarWhereWithAggregatesInput[]
    OR?: RoleScalarWhereWithAggregatesInput[]
    NOT?: RoleScalarWhereWithAggregatesInput | RoleScalarWhereWithAggregatesInput[]
    roleId?: StringWithAggregatesFilter<"Role"> | string
    roleName?: StringWithAggregatesFilter<"Role"> | string
    roleLevel?: IntWithAggregatesFilter<"Role"> | number
    roleDesc?: StringNullableWithAggregatesFilter<"Role"> | string | null
    roleIsActive?: BoolWithAggregatesFilter<"Role"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Role"> | Date | string
    createdBy?: StringNullableWithAggregatesFilter<"Role"> | string | null
    updatedAt?: DateTimeWithAggregatesFilter<"Role"> | Date | string
    updatedBy?: StringNullableWithAggregatesFilter<"Role"> | string | null
    isDeleted?: BoolWithAggregatesFilter<"Role"> | boolean
    deletedAt?: DateTimeNullableWithAggregatesFilter<"Role"> | Date | string | null
    deletedBy?: StringNullableWithAggregatesFilter<"Role"> | string | null
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    userId?: StringFilter<"User"> | string
    username?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    badgeNumber?: StringFilter<"User"> | string
    department?: StringNullableFilter<"User"> | string | null
    isActive?: BoolFilter<"User"> | boolean
    lastLogin?: DateTimeNullableFilter<"User"> | Date | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    createdBy?: StringNullableFilter<"User"> | string | null
    updatedAt?: DateTimeFilter<"User"> | Date | string
    updatedBy?: StringNullableFilter<"User"> | string | null
    isDeleted?: BoolFilter<"User"> | boolean
    deletedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    deletedBy?: StringNullableFilter<"User"> | string | null
    roleId?: StringFilter<"User"> | string
    token?: StringNullableFilter<"User"> | string | null
    creator?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    createdUsers?: UserListRelationFilter
    updater?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    updatedUsers?: UserListRelationFilter
    deleter?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    deletedUsers?: UserListRelationFilter
    role?: XOR<RoleScalarRelationFilter, RoleWhereInput>
    createdRoles?: RoleListRelationFilter
    updatedRoles?: RoleListRelationFilter
    deletedRoles?: RoleListRelationFilter
    orgNodes?: OrgChartListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    userId?: SortOrder
    username?: SortOrder
    password?: SortOrder
    name?: SortOrder
    badgeNumber?: SortOrder
    department?: SortOrderInput | SortOrder
    isActive?: SortOrder
    lastLogin?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrderInput | SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    deletedBy?: SortOrderInput | SortOrder
    roleId?: SortOrder
    token?: SortOrderInput | SortOrder
    creator?: UserOrderByWithRelationInput
    createdUsers?: UserOrderByRelationAggregateInput
    updater?: UserOrderByWithRelationInput
    updatedUsers?: UserOrderByRelationAggregateInput
    deleter?: UserOrderByWithRelationInput
    deletedUsers?: UserOrderByRelationAggregateInput
    role?: RoleOrderByWithRelationInput
    createdRoles?: RoleOrderByRelationAggregateInput
    updatedRoles?: RoleOrderByRelationAggregateInput
    deletedRoles?: RoleOrderByRelationAggregateInput
    orgNodes?: OrgChartOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    userId?: string
    username?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    password?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    badgeNumber?: StringFilter<"User"> | string
    department?: StringNullableFilter<"User"> | string | null
    isActive?: BoolFilter<"User"> | boolean
    lastLogin?: DateTimeNullableFilter<"User"> | Date | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    createdBy?: StringNullableFilter<"User"> | string | null
    updatedAt?: DateTimeFilter<"User"> | Date | string
    updatedBy?: StringNullableFilter<"User"> | string | null
    isDeleted?: BoolFilter<"User"> | boolean
    deletedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    deletedBy?: StringNullableFilter<"User"> | string | null
    roleId?: StringFilter<"User"> | string
    token?: StringNullableFilter<"User"> | string | null
    creator?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    createdUsers?: UserListRelationFilter
    updater?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    updatedUsers?: UserListRelationFilter
    deleter?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    deletedUsers?: UserListRelationFilter
    role?: XOR<RoleScalarRelationFilter, RoleWhereInput>
    createdRoles?: RoleListRelationFilter
    updatedRoles?: RoleListRelationFilter
    deletedRoles?: RoleListRelationFilter
    orgNodes?: OrgChartListRelationFilter
  }, "userId" | "username">

  export type UserOrderByWithAggregationInput = {
    userId?: SortOrder
    username?: SortOrder
    password?: SortOrder
    name?: SortOrder
    badgeNumber?: SortOrder
    department?: SortOrderInput | SortOrder
    isActive?: SortOrder
    lastLogin?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrderInput | SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    deletedBy?: SortOrderInput | SortOrder
    roleId?: SortOrder
    token?: SortOrderInput | SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    userId?: StringWithAggregatesFilter<"User"> | string
    username?: StringWithAggregatesFilter<"User"> | string
    password?: StringWithAggregatesFilter<"User"> | string
    name?: StringWithAggregatesFilter<"User"> | string
    badgeNumber?: StringWithAggregatesFilter<"User"> | string
    department?: StringNullableWithAggregatesFilter<"User"> | string | null
    isActive?: BoolWithAggregatesFilter<"User"> | boolean
    lastLogin?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    createdBy?: StringNullableWithAggregatesFilter<"User"> | string | null
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedBy?: StringNullableWithAggregatesFilter<"User"> | string | null
    isDeleted?: BoolWithAggregatesFilter<"User"> | boolean
    deletedAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    deletedBy?: StringNullableWithAggregatesFilter<"User"> | string | null
    roleId?: StringWithAggregatesFilter<"User"> | string
    token?: StringNullableWithAggregatesFilter<"User"> | string | null
  }

  export type OrgStructureWhereInput = {
    AND?: OrgStructureWhereInput | OrgStructureWhereInput[]
    OR?: OrgStructureWhereInput[]
    NOT?: OrgStructureWhereInput | OrgStructureWhereInput[]
    structureId?: StringFilter<"OrgStructure"> | string
    name?: StringFilter<"OrgStructure"> | string
    description?: StringNullableFilter<"OrgStructure"> | string | null
    rootNodeId?: StringNullableFilter<"OrgStructure"> | string | null
    createdAt?: DateTimeFilter<"OrgStructure"> | Date | string
    createdBy?: StringNullableFilter<"OrgStructure"> | string | null
    updatedAt?: DateTimeFilter<"OrgStructure"> | Date | string
    updatedBy?: StringNullableFilter<"OrgStructure"> | string | null
    isDeleted?: BoolFilter<"OrgStructure"> | boolean
    deletedAt?: DateTimeNullableFilter<"OrgStructure"> | Date | string | null
    deletedBy?: StringNullableFilter<"OrgStructure"> | string | null
    nodes?: OrgChartListRelationFilter
  }

  export type OrgStructureOrderByWithRelationInput = {
    structureId?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    rootNodeId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrderInput | SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    deletedBy?: SortOrderInput | SortOrder
    nodes?: OrgChartOrderByRelationAggregateInput
  }

  export type OrgStructureWhereUniqueInput = Prisma.AtLeast<{
    structureId?: string
    AND?: OrgStructureWhereInput | OrgStructureWhereInput[]
    OR?: OrgStructureWhereInput[]
    NOT?: OrgStructureWhereInput | OrgStructureWhereInput[]
    name?: StringFilter<"OrgStructure"> | string
    description?: StringNullableFilter<"OrgStructure"> | string | null
    rootNodeId?: StringNullableFilter<"OrgStructure"> | string | null
    createdAt?: DateTimeFilter<"OrgStructure"> | Date | string
    createdBy?: StringNullableFilter<"OrgStructure"> | string | null
    updatedAt?: DateTimeFilter<"OrgStructure"> | Date | string
    updatedBy?: StringNullableFilter<"OrgStructure"> | string | null
    isDeleted?: BoolFilter<"OrgStructure"> | boolean
    deletedAt?: DateTimeNullableFilter<"OrgStructure"> | Date | string | null
    deletedBy?: StringNullableFilter<"OrgStructure"> | string | null
    nodes?: OrgChartListRelationFilter
  }, "structureId">

  export type OrgStructureOrderByWithAggregationInput = {
    structureId?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    rootNodeId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrderInput | SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    deletedBy?: SortOrderInput | SortOrder
    _count?: OrgStructureCountOrderByAggregateInput
    _max?: OrgStructureMaxOrderByAggregateInput
    _min?: OrgStructureMinOrderByAggregateInput
  }

  export type OrgStructureScalarWhereWithAggregatesInput = {
    AND?: OrgStructureScalarWhereWithAggregatesInput | OrgStructureScalarWhereWithAggregatesInput[]
    OR?: OrgStructureScalarWhereWithAggregatesInput[]
    NOT?: OrgStructureScalarWhereWithAggregatesInput | OrgStructureScalarWhereWithAggregatesInput[]
    structureId?: StringWithAggregatesFilter<"OrgStructure"> | string
    name?: StringWithAggregatesFilter<"OrgStructure"> | string
    description?: StringNullableWithAggregatesFilter<"OrgStructure"> | string | null
    rootNodeId?: StringNullableWithAggregatesFilter<"OrgStructure"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"OrgStructure"> | Date | string
    createdBy?: StringNullableWithAggregatesFilter<"OrgStructure"> | string | null
    updatedAt?: DateTimeWithAggregatesFilter<"OrgStructure"> | Date | string
    updatedBy?: StringNullableWithAggregatesFilter<"OrgStructure"> | string | null
    isDeleted?: BoolWithAggregatesFilter<"OrgStructure"> | boolean
    deletedAt?: DateTimeNullableWithAggregatesFilter<"OrgStructure"> | Date | string | null
    deletedBy?: StringNullableWithAggregatesFilter<"OrgStructure"> | string | null
  }

  export type OrgChartWhereInput = {
    AND?: OrgChartWhereInput | OrgChartWhereInput[]
    OR?: OrgChartWhereInput[]
    NOT?: OrgChartWhereInput | OrgChartWhereInput[]
    nodeId?: StringFilter<"OrgChart"> | string
    structureId?: StringFilter<"OrgChart"> | string
    userId?: StringNullableFilter<"OrgChart"> | string | null
    parentId?: StringNullableFilter<"OrgChart"> | string | null
    name?: StringNullableFilter<"OrgChart"> | string | null
    position?: StringFilter<"OrgChart"> | string
    orderIndex?: IntFilter<"OrgChart"> | number
    createdAt?: DateTimeFilter<"OrgChart"> | Date | string
    createdBy?: StringNullableFilter<"OrgChart"> | string | null
    updatedAt?: DateTimeFilter<"OrgChart"> | Date | string
    updatedBy?: StringNullableFilter<"OrgChart"> | string | null
    isDeleted?: BoolFilter<"OrgChart"> | boolean
    deletedAt?: DateTimeNullableFilter<"OrgChart"> | Date | string | null
    deletedBy?: StringNullableFilter<"OrgChart"> | string | null
    parent?: XOR<OrgChartNullableScalarRelationFilter, OrgChartWhereInput> | null
    children?: OrgChartListRelationFilter
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    structure?: XOR<OrgStructureScalarRelationFilter, OrgStructureWhereInput>
  }

  export type OrgChartOrderByWithRelationInput = {
    nodeId?: SortOrder
    structureId?: SortOrder
    userId?: SortOrderInput | SortOrder
    parentId?: SortOrderInput | SortOrder
    name?: SortOrderInput | SortOrder
    position?: SortOrder
    orderIndex?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrderInput | SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    deletedBy?: SortOrderInput | SortOrder
    parent?: OrgChartOrderByWithRelationInput
    children?: OrgChartOrderByRelationAggregateInput
    user?: UserOrderByWithRelationInput
    structure?: OrgStructureOrderByWithRelationInput
  }

  export type OrgChartWhereUniqueInput = Prisma.AtLeast<{
    nodeId?: string
    AND?: OrgChartWhereInput | OrgChartWhereInput[]
    OR?: OrgChartWhereInput[]
    NOT?: OrgChartWhereInput | OrgChartWhereInput[]
    structureId?: StringFilter<"OrgChart"> | string
    userId?: StringNullableFilter<"OrgChart"> | string | null
    parentId?: StringNullableFilter<"OrgChart"> | string | null
    name?: StringNullableFilter<"OrgChart"> | string | null
    position?: StringFilter<"OrgChart"> | string
    orderIndex?: IntFilter<"OrgChart"> | number
    createdAt?: DateTimeFilter<"OrgChart"> | Date | string
    createdBy?: StringNullableFilter<"OrgChart"> | string | null
    updatedAt?: DateTimeFilter<"OrgChart"> | Date | string
    updatedBy?: StringNullableFilter<"OrgChart"> | string | null
    isDeleted?: BoolFilter<"OrgChart"> | boolean
    deletedAt?: DateTimeNullableFilter<"OrgChart"> | Date | string | null
    deletedBy?: StringNullableFilter<"OrgChart"> | string | null
    parent?: XOR<OrgChartNullableScalarRelationFilter, OrgChartWhereInput> | null
    children?: OrgChartListRelationFilter
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    structure?: XOR<OrgStructureScalarRelationFilter, OrgStructureWhereInput>
  }, "nodeId">

  export type OrgChartOrderByWithAggregationInput = {
    nodeId?: SortOrder
    structureId?: SortOrder
    userId?: SortOrderInput | SortOrder
    parentId?: SortOrderInput | SortOrder
    name?: SortOrderInput | SortOrder
    position?: SortOrder
    orderIndex?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrderInput | SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    deletedBy?: SortOrderInput | SortOrder
    _count?: OrgChartCountOrderByAggregateInput
    _avg?: OrgChartAvgOrderByAggregateInput
    _max?: OrgChartMaxOrderByAggregateInput
    _min?: OrgChartMinOrderByAggregateInput
    _sum?: OrgChartSumOrderByAggregateInput
  }

  export type OrgChartScalarWhereWithAggregatesInput = {
    AND?: OrgChartScalarWhereWithAggregatesInput | OrgChartScalarWhereWithAggregatesInput[]
    OR?: OrgChartScalarWhereWithAggregatesInput[]
    NOT?: OrgChartScalarWhereWithAggregatesInput | OrgChartScalarWhereWithAggregatesInput[]
    nodeId?: StringWithAggregatesFilter<"OrgChart"> | string
    structureId?: StringWithAggregatesFilter<"OrgChart"> | string
    userId?: StringNullableWithAggregatesFilter<"OrgChart"> | string | null
    parentId?: StringNullableWithAggregatesFilter<"OrgChart"> | string | null
    name?: StringNullableWithAggregatesFilter<"OrgChart"> | string | null
    position?: StringWithAggregatesFilter<"OrgChart"> | string
    orderIndex?: IntWithAggregatesFilter<"OrgChart"> | number
    createdAt?: DateTimeWithAggregatesFilter<"OrgChart"> | Date | string
    createdBy?: StringNullableWithAggregatesFilter<"OrgChart"> | string | null
    updatedAt?: DateTimeWithAggregatesFilter<"OrgChart"> | Date | string
    updatedBy?: StringNullableWithAggregatesFilter<"OrgChart"> | string | null
    isDeleted?: BoolWithAggregatesFilter<"OrgChart"> | boolean
    deletedAt?: DateTimeNullableWithAggregatesFilter<"OrgChart"> | Date | string | null
    deletedBy?: StringNullableWithAggregatesFilter<"OrgChart"> | string | null
  }

  export type RoleCreateInput = {
    roleId: string
    roleName: string
    roleLevel: number
    roleDesc?: string | null
    roleIsActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    isDeleted?: boolean
    deletedAt?: Date | string | null
    creator?: UserCreateNestedOneWithoutCreatedRolesInput
    updater?: UserCreateNestedOneWithoutUpdatedRolesInput
    deleter?: UserCreateNestedOneWithoutDeletedRolesInput
    users?: UserCreateNestedManyWithoutRoleInput
  }

  export type RoleUncheckedCreateInput = {
    roleId: string
    roleName: string
    roleLevel: number
    roleDesc?: string | null
    roleIsActive?: boolean
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    users?: UserUncheckedCreateNestedManyWithoutRoleInput
  }

  export type RoleUpdateInput = {
    roleId?: StringFieldUpdateOperationsInput | string
    roleName?: StringFieldUpdateOperationsInput | string
    roleLevel?: IntFieldUpdateOperationsInput | number
    roleDesc?: NullableStringFieldUpdateOperationsInput | string | null
    roleIsActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    creator?: UserUpdateOneWithoutCreatedRolesNestedInput
    updater?: UserUpdateOneWithoutUpdatedRolesNestedInput
    deleter?: UserUpdateOneWithoutDeletedRolesNestedInput
    users?: UserUpdateManyWithoutRoleNestedInput
  }

  export type RoleUncheckedUpdateInput = {
    roleId?: StringFieldUpdateOperationsInput | string
    roleName?: StringFieldUpdateOperationsInput | string
    roleLevel?: IntFieldUpdateOperationsInput | number
    roleDesc?: NullableStringFieldUpdateOperationsInput | string | null
    roleIsActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    users?: UserUncheckedUpdateManyWithoutRoleNestedInput
  }

  export type RoleCreateManyInput = {
    roleId: string
    roleName: string
    roleLevel: number
    roleDesc?: string | null
    roleIsActive?: boolean
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
  }

  export type RoleUpdateManyMutationInput = {
    roleId?: StringFieldUpdateOperationsInput | string
    roleName?: StringFieldUpdateOperationsInput | string
    roleLevel?: IntFieldUpdateOperationsInput | number
    roleDesc?: NullableStringFieldUpdateOperationsInput | string | null
    roleIsActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RoleUncheckedUpdateManyInput = {
    roleId?: StringFieldUpdateOperationsInput | string
    roleName?: StringFieldUpdateOperationsInput | string
    roleLevel?: IntFieldUpdateOperationsInput | number
    roleDesc?: NullableStringFieldUpdateOperationsInput | string | null
    roleIsActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserCreateInput = {
    userId: string
    username: string
    password: string
    name: string
    badgeNumber: string
    department?: string | null
    isActive?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    isDeleted?: boolean
    deletedAt?: Date | string | null
    token?: string | null
    creator?: UserCreateNestedOneWithoutCreatedUsersInput
    createdUsers?: UserCreateNestedManyWithoutCreatorInput
    updater?: UserCreateNestedOneWithoutUpdatedUsersInput
    updatedUsers?: UserCreateNestedManyWithoutUpdaterInput
    deleter?: UserCreateNestedOneWithoutDeletedUsersInput
    deletedUsers?: UserCreateNestedManyWithoutDeleterInput
    role: RoleCreateNestedOneWithoutUsersInput
    createdRoles?: RoleCreateNestedManyWithoutCreatorInput
    updatedRoles?: RoleCreateNestedManyWithoutUpdaterInput
    deletedRoles?: RoleCreateNestedManyWithoutDeleterInput
    orgNodes?: OrgChartCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    userId: string
    username: string
    password: string
    name: string
    badgeNumber: string
    department?: string | null
    isActive?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    roleId: string
    token?: string | null
    createdUsers?: UserUncheckedCreateNestedManyWithoutCreatorInput
    updatedUsers?: UserUncheckedCreateNestedManyWithoutUpdaterInput
    deletedUsers?: UserUncheckedCreateNestedManyWithoutDeleterInput
    createdRoles?: RoleUncheckedCreateNestedManyWithoutCreatorInput
    updatedRoles?: RoleUncheckedCreateNestedManyWithoutUpdaterInput
    deletedRoles?: RoleUncheckedCreateNestedManyWithoutDeleterInput
    orgNodes?: OrgChartUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    badgeNumber?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    token?: NullableStringFieldUpdateOperationsInput | string | null
    creator?: UserUpdateOneWithoutCreatedUsersNestedInput
    createdUsers?: UserUpdateManyWithoutCreatorNestedInput
    updater?: UserUpdateOneWithoutUpdatedUsersNestedInput
    updatedUsers?: UserUpdateManyWithoutUpdaterNestedInput
    deleter?: UserUpdateOneWithoutDeletedUsersNestedInput
    deletedUsers?: UserUpdateManyWithoutDeleterNestedInput
    role?: RoleUpdateOneRequiredWithoutUsersNestedInput
    createdRoles?: RoleUpdateManyWithoutCreatorNestedInput
    updatedRoles?: RoleUpdateManyWithoutUpdaterNestedInput
    deletedRoles?: RoleUpdateManyWithoutDeleterNestedInput
    orgNodes?: OrgChartUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    badgeNumber?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    roleId?: StringFieldUpdateOperationsInput | string
    token?: NullableStringFieldUpdateOperationsInput | string | null
    createdUsers?: UserUncheckedUpdateManyWithoutCreatorNestedInput
    updatedUsers?: UserUncheckedUpdateManyWithoutUpdaterNestedInput
    deletedUsers?: UserUncheckedUpdateManyWithoutDeleterNestedInput
    createdRoles?: RoleUncheckedUpdateManyWithoutCreatorNestedInput
    updatedRoles?: RoleUncheckedUpdateManyWithoutUpdaterNestedInput
    deletedRoles?: RoleUncheckedUpdateManyWithoutDeleterNestedInput
    orgNodes?: OrgChartUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    userId: string
    username: string
    password: string
    name: string
    badgeNumber: string
    department?: string | null
    isActive?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    roleId: string
    token?: string | null
  }

  export type UserUpdateManyMutationInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    badgeNumber?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    token?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserUncheckedUpdateManyInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    badgeNumber?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    roleId?: StringFieldUpdateOperationsInput | string
    token?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OrgStructureCreateInput = {
    structureId: string
    name: string
    description?: string | null
    rootNodeId?: string | null
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    nodes?: OrgChartCreateNestedManyWithoutStructureInput
  }

  export type OrgStructureUncheckedCreateInput = {
    structureId: string
    name: string
    description?: string | null
    rootNodeId?: string | null
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    nodes?: OrgChartUncheckedCreateNestedManyWithoutStructureInput
  }

  export type OrgStructureUpdateInput = {
    structureId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    rootNodeId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    nodes?: OrgChartUpdateManyWithoutStructureNestedInput
  }

  export type OrgStructureUncheckedUpdateInput = {
    structureId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    rootNodeId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    nodes?: OrgChartUncheckedUpdateManyWithoutStructureNestedInput
  }

  export type OrgStructureCreateManyInput = {
    structureId: string
    name: string
    description?: string | null
    rootNodeId?: string | null
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
  }

  export type OrgStructureUpdateManyMutationInput = {
    structureId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    rootNodeId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OrgStructureUncheckedUpdateManyInput = {
    structureId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    rootNodeId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OrgChartCreateInput = {
    nodeId: string
    name?: string | null
    position: string
    orderIndex?: number
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    parent?: OrgChartCreateNestedOneWithoutChildrenInput
    children?: OrgChartCreateNestedManyWithoutParentInput
    user?: UserCreateNestedOneWithoutOrgNodesInput
    structure: OrgStructureCreateNestedOneWithoutNodesInput
  }

  export type OrgChartUncheckedCreateInput = {
    nodeId: string
    structureId: string
    userId?: string | null
    parentId?: string | null
    name?: string | null
    position: string
    orderIndex?: number
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    children?: OrgChartUncheckedCreateNestedManyWithoutParentInput
  }

  export type OrgChartUpdateInput = {
    nodeId?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    orderIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    parent?: OrgChartUpdateOneWithoutChildrenNestedInput
    children?: OrgChartUpdateManyWithoutParentNestedInput
    user?: UserUpdateOneWithoutOrgNodesNestedInput
    structure?: OrgStructureUpdateOneRequiredWithoutNodesNestedInput
  }

  export type OrgChartUncheckedUpdateInput = {
    nodeId?: StringFieldUpdateOperationsInput | string
    structureId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    orderIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    children?: OrgChartUncheckedUpdateManyWithoutParentNestedInput
  }

  export type OrgChartCreateManyInput = {
    nodeId: string
    structureId: string
    userId?: string | null
    parentId?: string | null
    name?: string | null
    position: string
    orderIndex?: number
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
  }

  export type OrgChartUpdateManyMutationInput = {
    nodeId?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    orderIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OrgChartUncheckedUpdateManyInput = {
    nodeId?: StringFieldUpdateOperationsInput | string
    structureId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    orderIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type UserNullableScalarRelationFilter = {
    is?: UserWhereInput | null
    isNot?: UserWhereInput | null
  }

  export type UserListRelationFilter = {
    every?: UserWhereInput
    some?: UserWhereInput
    none?: UserWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type UserOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RoleCountOrderByAggregateInput = {
    roleId?: SortOrder
    roleName?: SortOrder
    roleLevel?: SortOrder
    roleDesc?: SortOrder
    roleIsActive?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    deletedBy?: SortOrder
  }

  export type RoleAvgOrderByAggregateInput = {
    roleLevel?: SortOrder
  }

  export type RoleMaxOrderByAggregateInput = {
    roleId?: SortOrder
    roleName?: SortOrder
    roleLevel?: SortOrder
    roleDesc?: SortOrder
    roleIsActive?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    deletedBy?: SortOrder
  }

  export type RoleMinOrderByAggregateInput = {
    roleId?: SortOrder
    roleName?: SortOrder
    roleLevel?: SortOrder
    roleDesc?: SortOrder
    roleIsActive?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    deletedBy?: SortOrder
  }

  export type RoleSumOrderByAggregateInput = {
    roleLevel?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type RoleScalarRelationFilter = {
    is?: RoleWhereInput
    isNot?: RoleWhereInput
  }

  export type RoleListRelationFilter = {
    every?: RoleWhereInput
    some?: RoleWhereInput
    none?: RoleWhereInput
  }

  export type OrgChartListRelationFilter = {
    every?: OrgChartWhereInput
    some?: OrgChartWhereInput
    none?: OrgChartWhereInput
  }

  export type RoleOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OrgChartOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    userId?: SortOrder
    username?: SortOrder
    password?: SortOrder
    name?: SortOrder
    badgeNumber?: SortOrder
    department?: SortOrder
    isActive?: SortOrder
    lastLogin?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    deletedBy?: SortOrder
    roleId?: SortOrder
    token?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    userId?: SortOrder
    username?: SortOrder
    password?: SortOrder
    name?: SortOrder
    badgeNumber?: SortOrder
    department?: SortOrder
    isActive?: SortOrder
    lastLogin?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    deletedBy?: SortOrder
    roleId?: SortOrder
    token?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    userId?: SortOrder
    username?: SortOrder
    password?: SortOrder
    name?: SortOrder
    badgeNumber?: SortOrder
    department?: SortOrder
    isActive?: SortOrder
    lastLogin?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    deletedBy?: SortOrder
    roleId?: SortOrder
    token?: SortOrder
  }

  export type OrgStructureCountOrderByAggregateInput = {
    structureId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    rootNodeId?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    deletedBy?: SortOrder
  }

  export type OrgStructureMaxOrderByAggregateInput = {
    structureId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    rootNodeId?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    deletedBy?: SortOrder
  }

  export type OrgStructureMinOrderByAggregateInput = {
    structureId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    rootNodeId?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    deletedBy?: SortOrder
  }

  export type OrgChartNullableScalarRelationFilter = {
    is?: OrgChartWhereInput | null
    isNot?: OrgChartWhereInput | null
  }

  export type OrgStructureScalarRelationFilter = {
    is?: OrgStructureWhereInput
    isNot?: OrgStructureWhereInput
  }

  export type OrgChartCountOrderByAggregateInput = {
    nodeId?: SortOrder
    structureId?: SortOrder
    userId?: SortOrder
    parentId?: SortOrder
    name?: SortOrder
    position?: SortOrder
    orderIndex?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    deletedBy?: SortOrder
  }

  export type OrgChartAvgOrderByAggregateInput = {
    orderIndex?: SortOrder
  }

  export type OrgChartMaxOrderByAggregateInput = {
    nodeId?: SortOrder
    structureId?: SortOrder
    userId?: SortOrder
    parentId?: SortOrder
    name?: SortOrder
    position?: SortOrder
    orderIndex?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    deletedBy?: SortOrder
  }

  export type OrgChartMinOrderByAggregateInput = {
    nodeId?: SortOrder
    structureId?: SortOrder
    userId?: SortOrder
    parentId?: SortOrder
    name?: SortOrder
    position?: SortOrder
    orderIndex?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    deletedBy?: SortOrder
  }

  export type OrgChartSumOrderByAggregateInput = {
    orderIndex?: SortOrder
  }

  export type UserCreateNestedOneWithoutCreatedRolesInput = {
    create?: XOR<UserCreateWithoutCreatedRolesInput, UserUncheckedCreateWithoutCreatedRolesInput>
    connectOrCreate?: UserCreateOrConnectWithoutCreatedRolesInput
    connect?: UserWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutUpdatedRolesInput = {
    create?: XOR<UserCreateWithoutUpdatedRolesInput, UserUncheckedCreateWithoutUpdatedRolesInput>
    connectOrCreate?: UserCreateOrConnectWithoutUpdatedRolesInput
    connect?: UserWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutDeletedRolesInput = {
    create?: XOR<UserCreateWithoutDeletedRolesInput, UserUncheckedCreateWithoutDeletedRolesInput>
    connectOrCreate?: UserCreateOrConnectWithoutDeletedRolesInput
    connect?: UserWhereUniqueInput
  }

  export type UserCreateNestedManyWithoutRoleInput = {
    create?: XOR<UserCreateWithoutRoleInput, UserUncheckedCreateWithoutRoleInput> | UserCreateWithoutRoleInput[] | UserUncheckedCreateWithoutRoleInput[]
    connectOrCreate?: UserCreateOrConnectWithoutRoleInput | UserCreateOrConnectWithoutRoleInput[]
    createMany?: UserCreateManyRoleInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutRoleInput = {
    create?: XOR<UserCreateWithoutRoleInput, UserUncheckedCreateWithoutRoleInput> | UserCreateWithoutRoleInput[] | UserUncheckedCreateWithoutRoleInput[]
    connectOrCreate?: UserCreateOrConnectWithoutRoleInput | UserCreateOrConnectWithoutRoleInput[]
    createMany?: UserCreateManyRoleInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type UserUpdateOneWithoutCreatedRolesNestedInput = {
    create?: XOR<UserCreateWithoutCreatedRolesInput, UserUncheckedCreateWithoutCreatedRolesInput>
    connectOrCreate?: UserCreateOrConnectWithoutCreatedRolesInput
    upsert?: UserUpsertWithoutCreatedRolesInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutCreatedRolesInput, UserUpdateWithoutCreatedRolesInput>, UserUncheckedUpdateWithoutCreatedRolesInput>
  }

  export type UserUpdateOneWithoutUpdatedRolesNestedInput = {
    create?: XOR<UserCreateWithoutUpdatedRolesInput, UserUncheckedCreateWithoutUpdatedRolesInput>
    connectOrCreate?: UserCreateOrConnectWithoutUpdatedRolesInput
    upsert?: UserUpsertWithoutUpdatedRolesInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutUpdatedRolesInput, UserUpdateWithoutUpdatedRolesInput>, UserUncheckedUpdateWithoutUpdatedRolesInput>
  }

  export type UserUpdateOneWithoutDeletedRolesNestedInput = {
    create?: XOR<UserCreateWithoutDeletedRolesInput, UserUncheckedCreateWithoutDeletedRolesInput>
    connectOrCreate?: UserCreateOrConnectWithoutDeletedRolesInput
    upsert?: UserUpsertWithoutDeletedRolesInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutDeletedRolesInput, UserUpdateWithoutDeletedRolesInput>, UserUncheckedUpdateWithoutDeletedRolesInput>
  }

  export type UserUpdateManyWithoutRoleNestedInput = {
    create?: XOR<UserCreateWithoutRoleInput, UserUncheckedCreateWithoutRoleInput> | UserCreateWithoutRoleInput[] | UserUncheckedCreateWithoutRoleInput[]
    connectOrCreate?: UserCreateOrConnectWithoutRoleInput | UserCreateOrConnectWithoutRoleInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutRoleInput | UserUpsertWithWhereUniqueWithoutRoleInput[]
    createMany?: UserCreateManyRoleInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutRoleInput | UserUpdateWithWhereUniqueWithoutRoleInput[]
    updateMany?: UserUpdateManyWithWhereWithoutRoleInput | UserUpdateManyWithWhereWithoutRoleInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type UserUncheckedUpdateManyWithoutRoleNestedInput = {
    create?: XOR<UserCreateWithoutRoleInput, UserUncheckedCreateWithoutRoleInput> | UserCreateWithoutRoleInput[] | UserUncheckedCreateWithoutRoleInput[]
    connectOrCreate?: UserCreateOrConnectWithoutRoleInput | UserCreateOrConnectWithoutRoleInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutRoleInput | UserUpsertWithWhereUniqueWithoutRoleInput[]
    createMany?: UserCreateManyRoleInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutRoleInput | UserUpdateWithWhereUniqueWithoutRoleInput[]
    updateMany?: UserUpdateManyWithWhereWithoutRoleInput | UserUpdateManyWithWhereWithoutRoleInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutCreatedUsersInput = {
    create?: XOR<UserCreateWithoutCreatedUsersInput, UserUncheckedCreateWithoutCreatedUsersInput>
    connectOrCreate?: UserCreateOrConnectWithoutCreatedUsersInput
    connect?: UserWhereUniqueInput
  }

  export type UserCreateNestedManyWithoutCreatorInput = {
    create?: XOR<UserCreateWithoutCreatorInput, UserUncheckedCreateWithoutCreatorInput> | UserCreateWithoutCreatorInput[] | UserUncheckedCreateWithoutCreatorInput[]
    connectOrCreate?: UserCreateOrConnectWithoutCreatorInput | UserCreateOrConnectWithoutCreatorInput[]
    createMany?: UserCreateManyCreatorInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type UserCreateNestedOneWithoutUpdatedUsersInput = {
    create?: XOR<UserCreateWithoutUpdatedUsersInput, UserUncheckedCreateWithoutUpdatedUsersInput>
    connectOrCreate?: UserCreateOrConnectWithoutUpdatedUsersInput
    connect?: UserWhereUniqueInput
  }

  export type UserCreateNestedManyWithoutUpdaterInput = {
    create?: XOR<UserCreateWithoutUpdaterInput, UserUncheckedCreateWithoutUpdaterInput> | UserCreateWithoutUpdaterInput[] | UserUncheckedCreateWithoutUpdaterInput[]
    connectOrCreate?: UserCreateOrConnectWithoutUpdaterInput | UserCreateOrConnectWithoutUpdaterInput[]
    createMany?: UserCreateManyUpdaterInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type UserCreateNestedOneWithoutDeletedUsersInput = {
    create?: XOR<UserCreateWithoutDeletedUsersInput, UserUncheckedCreateWithoutDeletedUsersInput>
    connectOrCreate?: UserCreateOrConnectWithoutDeletedUsersInput
    connect?: UserWhereUniqueInput
  }

  export type UserCreateNestedManyWithoutDeleterInput = {
    create?: XOR<UserCreateWithoutDeleterInput, UserUncheckedCreateWithoutDeleterInput> | UserCreateWithoutDeleterInput[] | UserUncheckedCreateWithoutDeleterInput[]
    connectOrCreate?: UserCreateOrConnectWithoutDeleterInput | UserCreateOrConnectWithoutDeleterInput[]
    createMany?: UserCreateManyDeleterInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type RoleCreateNestedOneWithoutUsersInput = {
    create?: XOR<RoleCreateWithoutUsersInput, RoleUncheckedCreateWithoutUsersInput>
    connectOrCreate?: RoleCreateOrConnectWithoutUsersInput
    connect?: RoleWhereUniqueInput
  }

  export type RoleCreateNestedManyWithoutCreatorInput = {
    create?: XOR<RoleCreateWithoutCreatorInput, RoleUncheckedCreateWithoutCreatorInput> | RoleCreateWithoutCreatorInput[] | RoleUncheckedCreateWithoutCreatorInput[]
    connectOrCreate?: RoleCreateOrConnectWithoutCreatorInput | RoleCreateOrConnectWithoutCreatorInput[]
    createMany?: RoleCreateManyCreatorInputEnvelope
    connect?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
  }

  export type RoleCreateNestedManyWithoutUpdaterInput = {
    create?: XOR<RoleCreateWithoutUpdaterInput, RoleUncheckedCreateWithoutUpdaterInput> | RoleCreateWithoutUpdaterInput[] | RoleUncheckedCreateWithoutUpdaterInput[]
    connectOrCreate?: RoleCreateOrConnectWithoutUpdaterInput | RoleCreateOrConnectWithoutUpdaterInput[]
    createMany?: RoleCreateManyUpdaterInputEnvelope
    connect?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
  }

  export type RoleCreateNestedManyWithoutDeleterInput = {
    create?: XOR<RoleCreateWithoutDeleterInput, RoleUncheckedCreateWithoutDeleterInput> | RoleCreateWithoutDeleterInput[] | RoleUncheckedCreateWithoutDeleterInput[]
    connectOrCreate?: RoleCreateOrConnectWithoutDeleterInput | RoleCreateOrConnectWithoutDeleterInput[]
    createMany?: RoleCreateManyDeleterInputEnvelope
    connect?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
  }

  export type OrgChartCreateNestedManyWithoutUserInput = {
    create?: XOR<OrgChartCreateWithoutUserInput, OrgChartUncheckedCreateWithoutUserInput> | OrgChartCreateWithoutUserInput[] | OrgChartUncheckedCreateWithoutUserInput[]
    connectOrCreate?: OrgChartCreateOrConnectWithoutUserInput | OrgChartCreateOrConnectWithoutUserInput[]
    createMany?: OrgChartCreateManyUserInputEnvelope
    connect?: OrgChartWhereUniqueInput | OrgChartWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutCreatorInput = {
    create?: XOR<UserCreateWithoutCreatorInput, UserUncheckedCreateWithoutCreatorInput> | UserCreateWithoutCreatorInput[] | UserUncheckedCreateWithoutCreatorInput[]
    connectOrCreate?: UserCreateOrConnectWithoutCreatorInput | UserCreateOrConnectWithoutCreatorInput[]
    createMany?: UserCreateManyCreatorInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutUpdaterInput = {
    create?: XOR<UserCreateWithoutUpdaterInput, UserUncheckedCreateWithoutUpdaterInput> | UserCreateWithoutUpdaterInput[] | UserUncheckedCreateWithoutUpdaterInput[]
    connectOrCreate?: UserCreateOrConnectWithoutUpdaterInput | UserCreateOrConnectWithoutUpdaterInput[]
    createMany?: UserCreateManyUpdaterInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutDeleterInput = {
    create?: XOR<UserCreateWithoutDeleterInput, UserUncheckedCreateWithoutDeleterInput> | UserCreateWithoutDeleterInput[] | UserUncheckedCreateWithoutDeleterInput[]
    connectOrCreate?: UserCreateOrConnectWithoutDeleterInput | UserCreateOrConnectWithoutDeleterInput[]
    createMany?: UserCreateManyDeleterInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type RoleUncheckedCreateNestedManyWithoutCreatorInput = {
    create?: XOR<RoleCreateWithoutCreatorInput, RoleUncheckedCreateWithoutCreatorInput> | RoleCreateWithoutCreatorInput[] | RoleUncheckedCreateWithoutCreatorInput[]
    connectOrCreate?: RoleCreateOrConnectWithoutCreatorInput | RoleCreateOrConnectWithoutCreatorInput[]
    createMany?: RoleCreateManyCreatorInputEnvelope
    connect?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
  }

  export type RoleUncheckedCreateNestedManyWithoutUpdaterInput = {
    create?: XOR<RoleCreateWithoutUpdaterInput, RoleUncheckedCreateWithoutUpdaterInput> | RoleCreateWithoutUpdaterInput[] | RoleUncheckedCreateWithoutUpdaterInput[]
    connectOrCreate?: RoleCreateOrConnectWithoutUpdaterInput | RoleCreateOrConnectWithoutUpdaterInput[]
    createMany?: RoleCreateManyUpdaterInputEnvelope
    connect?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
  }

  export type RoleUncheckedCreateNestedManyWithoutDeleterInput = {
    create?: XOR<RoleCreateWithoutDeleterInput, RoleUncheckedCreateWithoutDeleterInput> | RoleCreateWithoutDeleterInput[] | RoleUncheckedCreateWithoutDeleterInput[]
    connectOrCreate?: RoleCreateOrConnectWithoutDeleterInput | RoleCreateOrConnectWithoutDeleterInput[]
    createMany?: RoleCreateManyDeleterInputEnvelope
    connect?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
  }

  export type OrgChartUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<OrgChartCreateWithoutUserInput, OrgChartUncheckedCreateWithoutUserInput> | OrgChartCreateWithoutUserInput[] | OrgChartUncheckedCreateWithoutUserInput[]
    connectOrCreate?: OrgChartCreateOrConnectWithoutUserInput | OrgChartCreateOrConnectWithoutUserInput[]
    createMany?: OrgChartCreateManyUserInputEnvelope
    connect?: OrgChartWhereUniqueInput | OrgChartWhereUniqueInput[]
  }

  export type UserUpdateOneWithoutCreatedUsersNestedInput = {
    create?: XOR<UserCreateWithoutCreatedUsersInput, UserUncheckedCreateWithoutCreatedUsersInput>
    connectOrCreate?: UserCreateOrConnectWithoutCreatedUsersInput
    upsert?: UserUpsertWithoutCreatedUsersInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutCreatedUsersInput, UserUpdateWithoutCreatedUsersInput>, UserUncheckedUpdateWithoutCreatedUsersInput>
  }

  export type UserUpdateManyWithoutCreatorNestedInput = {
    create?: XOR<UserCreateWithoutCreatorInput, UserUncheckedCreateWithoutCreatorInput> | UserCreateWithoutCreatorInput[] | UserUncheckedCreateWithoutCreatorInput[]
    connectOrCreate?: UserCreateOrConnectWithoutCreatorInput | UserCreateOrConnectWithoutCreatorInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutCreatorInput | UserUpsertWithWhereUniqueWithoutCreatorInput[]
    createMany?: UserCreateManyCreatorInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutCreatorInput | UserUpdateWithWhereUniqueWithoutCreatorInput[]
    updateMany?: UserUpdateManyWithWhereWithoutCreatorInput | UserUpdateManyWithWhereWithoutCreatorInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type UserUpdateOneWithoutUpdatedUsersNestedInput = {
    create?: XOR<UserCreateWithoutUpdatedUsersInput, UserUncheckedCreateWithoutUpdatedUsersInput>
    connectOrCreate?: UserCreateOrConnectWithoutUpdatedUsersInput
    upsert?: UserUpsertWithoutUpdatedUsersInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutUpdatedUsersInput, UserUpdateWithoutUpdatedUsersInput>, UserUncheckedUpdateWithoutUpdatedUsersInput>
  }

  export type UserUpdateManyWithoutUpdaterNestedInput = {
    create?: XOR<UserCreateWithoutUpdaterInput, UserUncheckedCreateWithoutUpdaterInput> | UserCreateWithoutUpdaterInput[] | UserUncheckedCreateWithoutUpdaterInput[]
    connectOrCreate?: UserCreateOrConnectWithoutUpdaterInput | UserCreateOrConnectWithoutUpdaterInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutUpdaterInput | UserUpsertWithWhereUniqueWithoutUpdaterInput[]
    createMany?: UserCreateManyUpdaterInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutUpdaterInput | UserUpdateWithWhereUniqueWithoutUpdaterInput[]
    updateMany?: UserUpdateManyWithWhereWithoutUpdaterInput | UserUpdateManyWithWhereWithoutUpdaterInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type UserUpdateOneWithoutDeletedUsersNestedInput = {
    create?: XOR<UserCreateWithoutDeletedUsersInput, UserUncheckedCreateWithoutDeletedUsersInput>
    connectOrCreate?: UserCreateOrConnectWithoutDeletedUsersInput
    upsert?: UserUpsertWithoutDeletedUsersInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutDeletedUsersInput, UserUpdateWithoutDeletedUsersInput>, UserUncheckedUpdateWithoutDeletedUsersInput>
  }

  export type UserUpdateManyWithoutDeleterNestedInput = {
    create?: XOR<UserCreateWithoutDeleterInput, UserUncheckedCreateWithoutDeleterInput> | UserCreateWithoutDeleterInput[] | UserUncheckedCreateWithoutDeleterInput[]
    connectOrCreate?: UserCreateOrConnectWithoutDeleterInput | UserCreateOrConnectWithoutDeleterInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutDeleterInput | UserUpsertWithWhereUniqueWithoutDeleterInput[]
    createMany?: UserCreateManyDeleterInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutDeleterInput | UserUpdateWithWhereUniqueWithoutDeleterInput[]
    updateMany?: UserUpdateManyWithWhereWithoutDeleterInput | UserUpdateManyWithWhereWithoutDeleterInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type RoleUpdateOneRequiredWithoutUsersNestedInput = {
    create?: XOR<RoleCreateWithoutUsersInput, RoleUncheckedCreateWithoutUsersInput>
    connectOrCreate?: RoleCreateOrConnectWithoutUsersInput
    upsert?: RoleUpsertWithoutUsersInput
    connect?: RoleWhereUniqueInput
    update?: XOR<XOR<RoleUpdateToOneWithWhereWithoutUsersInput, RoleUpdateWithoutUsersInput>, RoleUncheckedUpdateWithoutUsersInput>
  }

  export type RoleUpdateManyWithoutCreatorNestedInput = {
    create?: XOR<RoleCreateWithoutCreatorInput, RoleUncheckedCreateWithoutCreatorInput> | RoleCreateWithoutCreatorInput[] | RoleUncheckedCreateWithoutCreatorInput[]
    connectOrCreate?: RoleCreateOrConnectWithoutCreatorInput | RoleCreateOrConnectWithoutCreatorInput[]
    upsert?: RoleUpsertWithWhereUniqueWithoutCreatorInput | RoleUpsertWithWhereUniqueWithoutCreatorInput[]
    createMany?: RoleCreateManyCreatorInputEnvelope
    set?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
    disconnect?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
    delete?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
    connect?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
    update?: RoleUpdateWithWhereUniqueWithoutCreatorInput | RoleUpdateWithWhereUniqueWithoutCreatorInput[]
    updateMany?: RoleUpdateManyWithWhereWithoutCreatorInput | RoleUpdateManyWithWhereWithoutCreatorInput[]
    deleteMany?: RoleScalarWhereInput | RoleScalarWhereInput[]
  }

  export type RoleUpdateManyWithoutUpdaterNestedInput = {
    create?: XOR<RoleCreateWithoutUpdaterInput, RoleUncheckedCreateWithoutUpdaterInput> | RoleCreateWithoutUpdaterInput[] | RoleUncheckedCreateWithoutUpdaterInput[]
    connectOrCreate?: RoleCreateOrConnectWithoutUpdaterInput | RoleCreateOrConnectWithoutUpdaterInput[]
    upsert?: RoleUpsertWithWhereUniqueWithoutUpdaterInput | RoleUpsertWithWhereUniqueWithoutUpdaterInput[]
    createMany?: RoleCreateManyUpdaterInputEnvelope
    set?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
    disconnect?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
    delete?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
    connect?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
    update?: RoleUpdateWithWhereUniqueWithoutUpdaterInput | RoleUpdateWithWhereUniqueWithoutUpdaterInput[]
    updateMany?: RoleUpdateManyWithWhereWithoutUpdaterInput | RoleUpdateManyWithWhereWithoutUpdaterInput[]
    deleteMany?: RoleScalarWhereInput | RoleScalarWhereInput[]
  }

  export type RoleUpdateManyWithoutDeleterNestedInput = {
    create?: XOR<RoleCreateWithoutDeleterInput, RoleUncheckedCreateWithoutDeleterInput> | RoleCreateWithoutDeleterInput[] | RoleUncheckedCreateWithoutDeleterInput[]
    connectOrCreate?: RoleCreateOrConnectWithoutDeleterInput | RoleCreateOrConnectWithoutDeleterInput[]
    upsert?: RoleUpsertWithWhereUniqueWithoutDeleterInput | RoleUpsertWithWhereUniqueWithoutDeleterInput[]
    createMany?: RoleCreateManyDeleterInputEnvelope
    set?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
    disconnect?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
    delete?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
    connect?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
    update?: RoleUpdateWithWhereUniqueWithoutDeleterInput | RoleUpdateWithWhereUniqueWithoutDeleterInput[]
    updateMany?: RoleUpdateManyWithWhereWithoutDeleterInput | RoleUpdateManyWithWhereWithoutDeleterInput[]
    deleteMany?: RoleScalarWhereInput | RoleScalarWhereInput[]
  }

  export type OrgChartUpdateManyWithoutUserNestedInput = {
    create?: XOR<OrgChartCreateWithoutUserInput, OrgChartUncheckedCreateWithoutUserInput> | OrgChartCreateWithoutUserInput[] | OrgChartUncheckedCreateWithoutUserInput[]
    connectOrCreate?: OrgChartCreateOrConnectWithoutUserInput | OrgChartCreateOrConnectWithoutUserInput[]
    upsert?: OrgChartUpsertWithWhereUniqueWithoutUserInput | OrgChartUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: OrgChartCreateManyUserInputEnvelope
    set?: OrgChartWhereUniqueInput | OrgChartWhereUniqueInput[]
    disconnect?: OrgChartWhereUniqueInput | OrgChartWhereUniqueInput[]
    delete?: OrgChartWhereUniqueInput | OrgChartWhereUniqueInput[]
    connect?: OrgChartWhereUniqueInput | OrgChartWhereUniqueInput[]
    update?: OrgChartUpdateWithWhereUniqueWithoutUserInput | OrgChartUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: OrgChartUpdateManyWithWhereWithoutUserInput | OrgChartUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: OrgChartScalarWhereInput | OrgChartScalarWhereInput[]
  }

  export type UserUncheckedUpdateManyWithoutCreatorNestedInput = {
    create?: XOR<UserCreateWithoutCreatorInput, UserUncheckedCreateWithoutCreatorInput> | UserCreateWithoutCreatorInput[] | UserUncheckedCreateWithoutCreatorInput[]
    connectOrCreate?: UserCreateOrConnectWithoutCreatorInput | UserCreateOrConnectWithoutCreatorInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutCreatorInput | UserUpsertWithWhereUniqueWithoutCreatorInput[]
    createMany?: UserCreateManyCreatorInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutCreatorInput | UserUpdateWithWhereUniqueWithoutCreatorInput[]
    updateMany?: UserUpdateManyWithWhereWithoutCreatorInput | UserUpdateManyWithWhereWithoutCreatorInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type UserUncheckedUpdateManyWithoutUpdaterNestedInput = {
    create?: XOR<UserCreateWithoutUpdaterInput, UserUncheckedCreateWithoutUpdaterInput> | UserCreateWithoutUpdaterInput[] | UserUncheckedCreateWithoutUpdaterInput[]
    connectOrCreate?: UserCreateOrConnectWithoutUpdaterInput | UserCreateOrConnectWithoutUpdaterInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutUpdaterInput | UserUpsertWithWhereUniqueWithoutUpdaterInput[]
    createMany?: UserCreateManyUpdaterInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutUpdaterInput | UserUpdateWithWhereUniqueWithoutUpdaterInput[]
    updateMany?: UserUpdateManyWithWhereWithoutUpdaterInput | UserUpdateManyWithWhereWithoutUpdaterInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type UserUncheckedUpdateManyWithoutDeleterNestedInput = {
    create?: XOR<UserCreateWithoutDeleterInput, UserUncheckedCreateWithoutDeleterInput> | UserCreateWithoutDeleterInput[] | UserUncheckedCreateWithoutDeleterInput[]
    connectOrCreate?: UserCreateOrConnectWithoutDeleterInput | UserCreateOrConnectWithoutDeleterInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutDeleterInput | UserUpsertWithWhereUniqueWithoutDeleterInput[]
    createMany?: UserCreateManyDeleterInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutDeleterInput | UserUpdateWithWhereUniqueWithoutDeleterInput[]
    updateMany?: UserUpdateManyWithWhereWithoutDeleterInput | UserUpdateManyWithWhereWithoutDeleterInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type RoleUncheckedUpdateManyWithoutCreatorNestedInput = {
    create?: XOR<RoleCreateWithoutCreatorInput, RoleUncheckedCreateWithoutCreatorInput> | RoleCreateWithoutCreatorInput[] | RoleUncheckedCreateWithoutCreatorInput[]
    connectOrCreate?: RoleCreateOrConnectWithoutCreatorInput | RoleCreateOrConnectWithoutCreatorInput[]
    upsert?: RoleUpsertWithWhereUniqueWithoutCreatorInput | RoleUpsertWithWhereUniqueWithoutCreatorInput[]
    createMany?: RoleCreateManyCreatorInputEnvelope
    set?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
    disconnect?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
    delete?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
    connect?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
    update?: RoleUpdateWithWhereUniqueWithoutCreatorInput | RoleUpdateWithWhereUniqueWithoutCreatorInput[]
    updateMany?: RoleUpdateManyWithWhereWithoutCreatorInput | RoleUpdateManyWithWhereWithoutCreatorInput[]
    deleteMany?: RoleScalarWhereInput | RoleScalarWhereInput[]
  }

  export type RoleUncheckedUpdateManyWithoutUpdaterNestedInput = {
    create?: XOR<RoleCreateWithoutUpdaterInput, RoleUncheckedCreateWithoutUpdaterInput> | RoleCreateWithoutUpdaterInput[] | RoleUncheckedCreateWithoutUpdaterInput[]
    connectOrCreate?: RoleCreateOrConnectWithoutUpdaterInput | RoleCreateOrConnectWithoutUpdaterInput[]
    upsert?: RoleUpsertWithWhereUniqueWithoutUpdaterInput | RoleUpsertWithWhereUniqueWithoutUpdaterInput[]
    createMany?: RoleCreateManyUpdaterInputEnvelope
    set?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
    disconnect?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
    delete?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
    connect?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
    update?: RoleUpdateWithWhereUniqueWithoutUpdaterInput | RoleUpdateWithWhereUniqueWithoutUpdaterInput[]
    updateMany?: RoleUpdateManyWithWhereWithoutUpdaterInput | RoleUpdateManyWithWhereWithoutUpdaterInput[]
    deleteMany?: RoleScalarWhereInput | RoleScalarWhereInput[]
  }

  export type RoleUncheckedUpdateManyWithoutDeleterNestedInput = {
    create?: XOR<RoleCreateWithoutDeleterInput, RoleUncheckedCreateWithoutDeleterInput> | RoleCreateWithoutDeleterInput[] | RoleUncheckedCreateWithoutDeleterInput[]
    connectOrCreate?: RoleCreateOrConnectWithoutDeleterInput | RoleCreateOrConnectWithoutDeleterInput[]
    upsert?: RoleUpsertWithWhereUniqueWithoutDeleterInput | RoleUpsertWithWhereUniqueWithoutDeleterInput[]
    createMany?: RoleCreateManyDeleterInputEnvelope
    set?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
    disconnect?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
    delete?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
    connect?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
    update?: RoleUpdateWithWhereUniqueWithoutDeleterInput | RoleUpdateWithWhereUniqueWithoutDeleterInput[]
    updateMany?: RoleUpdateManyWithWhereWithoutDeleterInput | RoleUpdateManyWithWhereWithoutDeleterInput[]
    deleteMany?: RoleScalarWhereInput | RoleScalarWhereInput[]
  }

  export type OrgChartUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<OrgChartCreateWithoutUserInput, OrgChartUncheckedCreateWithoutUserInput> | OrgChartCreateWithoutUserInput[] | OrgChartUncheckedCreateWithoutUserInput[]
    connectOrCreate?: OrgChartCreateOrConnectWithoutUserInput | OrgChartCreateOrConnectWithoutUserInput[]
    upsert?: OrgChartUpsertWithWhereUniqueWithoutUserInput | OrgChartUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: OrgChartCreateManyUserInputEnvelope
    set?: OrgChartWhereUniqueInput | OrgChartWhereUniqueInput[]
    disconnect?: OrgChartWhereUniqueInput | OrgChartWhereUniqueInput[]
    delete?: OrgChartWhereUniqueInput | OrgChartWhereUniqueInput[]
    connect?: OrgChartWhereUniqueInput | OrgChartWhereUniqueInput[]
    update?: OrgChartUpdateWithWhereUniqueWithoutUserInput | OrgChartUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: OrgChartUpdateManyWithWhereWithoutUserInput | OrgChartUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: OrgChartScalarWhereInput | OrgChartScalarWhereInput[]
  }

  export type OrgChartCreateNestedManyWithoutStructureInput = {
    create?: XOR<OrgChartCreateWithoutStructureInput, OrgChartUncheckedCreateWithoutStructureInput> | OrgChartCreateWithoutStructureInput[] | OrgChartUncheckedCreateWithoutStructureInput[]
    connectOrCreate?: OrgChartCreateOrConnectWithoutStructureInput | OrgChartCreateOrConnectWithoutStructureInput[]
    createMany?: OrgChartCreateManyStructureInputEnvelope
    connect?: OrgChartWhereUniqueInput | OrgChartWhereUniqueInput[]
  }

  export type OrgChartUncheckedCreateNestedManyWithoutStructureInput = {
    create?: XOR<OrgChartCreateWithoutStructureInput, OrgChartUncheckedCreateWithoutStructureInput> | OrgChartCreateWithoutStructureInput[] | OrgChartUncheckedCreateWithoutStructureInput[]
    connectOrCreate?: OrgChartCreateOrConnectWithoutStructureInput | OrgChartCreateOrConnectWithoutStructureInput[]
    createMany?: OrgChartCreateManyStructureInputEnvelope
    connect?: OrgChartWhereUniqueInput | OrgChartWhereUniqueInput[]
  }

  export type OrgChartUpdateManyWithoutStructureNestedInput = {
    create?: XOR<OrgChartCreateWithoutStructureInput, OrgChartUncheckedCreateWithoutStructureInput> | OrgChartCreateWithoutStructureInput[] | OrgChartUncheckedCreateWithoutStructureInput[]
    connectOrCreate?: OrgChartCreateOrConnectWithoutStructureInput | OrgChartCreateOrConnectWithoutStructureInput[]
    upsert?: OrgChartUpsertWithWhereUniqueWithoutStructureInput | OrgChartUpsertWithWhereUniqueWithoutStructureInput[]
    createMany?: OrgChartCreateManyStructureInputEnvelope
    set?: OrgChartWhereUniqueInput | OrgChartWhereUniqueInput[]
    disconnect?: OrgChartWhereUniqueInput | OrgChartWhereUniqueInput[]
    delete?: OrgChartWhereUniqueInput | OrgChartWhereUniqueInput[]
    connect?: OrgChartWhereUniqueInput | OrgChartWhereUniqueInput[]
    update?: OrgChartUpdateWithWhereUniqueWithoutStructureInput | OrgChartUpdateWithWhereUniqueWithoutStructureInput[]
    updateMany?: OrgChartUpdateManyWithWhereWithoutStructureInput | OrgChartUpdateManyWithWhereWithoutStructureInput[]
    deleteMany?: OrgChartScalarWhereInput | OrgChartScalarWhereInput[]
  }

  export type OrgChartUncheckedUpdateManyWithoutStructureNestedInput = {
    create?: XOR<OrgChartCreateWithoutStructureInput, OrgChartUncheckedCreateWithoutStructureInput> | OrgChartCreateWithoutStructureInput[] | OrgChartUncheckedCreateWithoutStructureInput[]
    connectOrCreate?: OrgChartCreateOrConnectWithoutStructureInput | OrgChartCreateOrConnectWithoutStructureInput[]
    upsert?: OrgChartUpsertWithWhereUniqueWithoutStructureInput | OrgChartUpsertWithWhereUniqueWithoutStructureInput[]
    createMany?: OrgChartCreateManyStructureInputEnvelope
    set?: OrgChartWhereUniqueInput | OrgChartWhereUniqueInput[]
    disconnect?: OrgChartWhereUniqueInput | OrgChartWhereUniqueInput[]
    delete?: OrgChartWhereUniqueInput | OrgChartWhereUniqueInput[]
    connect?: OrgChartWhereUniqueInput | OrgChartWhereUniqueInput[]
    update?: OrgChartUpdateWithWhereUniqueWithoutStructureInput | OrgChartUpdateWithWhereUniqueWithoutStructureInput[]
    updateMany?: OrgChartUpdateManyWithWhereWithoutStructureInput | OrgChartUpdateManyWithWhereWithoutStructureInput[]
    deleteMany?: OrgChartScalarWhereInput | OrgChartScalarWhereInput[]
  }

  export type OrgChartCreateNestedOneWithoutChildrenInput = {
    create?: XOR<OrgChartCreateWithoutChildrenInput, OrgChartUncheckedCreateWithoutChildrenInput>
    connectOrCreate?: OrgChartCreateOrConnectWithoutChildrenInput
    connect?: OrgChartWhereUniqueInput
  }

  export type OrgChartCreateNestedManyWithoutParentInput = {
    create?: XOR<OrgChartCreateWithoutParentInput, OrgChartUncheckedCreateWithoutParentInput> | OrgChartCreateWithoutParentInput[] | OrgChartUncheckedCreateWithoutParentInput[]
    connectOrCreate?: OrgChartCreateOrConnectWithoutParentInput | OrgChartCreateOrConnectWithoutParentInput[]
    createMany?: OrgChartCreateManyParentInputEnvelope
    connect?: OrgChartWhereUniqueInput | OrgChartWhereUniqueInput[]
  }

  export type UserCreateNestedOneWithoutOrgNodesInput = {
    create?: XOR<UserCreateWithoutOrgNodesInput, UserUncheckedCreateWithoutOrgNodesInput>
    connectOrCreate?: UserCreateOrConnectWithoutOrgNodesInput
    connect?: UserWhereUniqueInput
  }

  export type OrgStructureCreateNestedOneWithoutNodesInput = {
    create?: XOR<OrgStructureCreateWithoutNodesInput, OrgStructureUncheckedCreateWithoutNodesInput>
    connectOrCreate?: OrgStructureCreateOrConnectWithoutNodesInput
    connect?: OrgStructureWhereUniqueInput
  }

  export type OrgChartUncheckedCreateNestedManyWithoutParentInput = {
    create?: XOR<OrgChartCreateWithoutParentInput, OrgChartUncheckedCreateWithoutParentInput> | OrgChartCreateWithoutParentInput[] | OrgChartUncheckedCreateWithoutParentInput[]
    connectOrCreate?: OrgChartCreateOrConnectWithoutParentInput | OrgChartCreateOrConnectWithoutParentInput[]
    createMany?: OrgChartCreateManyParentInputEnvelope
    connect?: OrgChartWhereUniqueInput | OrgChartWhereUniqueInput[]
  }

  export type OrgChartUpdateOneWithoutChildrenNestedInput = {
    create?: XOR<OrgChartCreateWithoutChildrenInput, OrgChartUncheckedCreateWithoutChildrenInput>
    connectOrCreate?: OrgChartCreateOrConnectWithoutChildrenInput
    upsert?: OrgChartUpsertWithoutChildrenInput
    disconnect?: OrgChartWhereInput | boolean
    delete?: OrgChartWhereInput | boolean
    connect?: OrgChartWhereUniqueInput
    update?: XOR<XOR<OrgChartUpdateToOneWithWhereWithoutChildrenInput, OrgChartUpdateWithoutChildrenInput>, OrgChartUncheckedUpdateWithoutChildrenInput>
  }

  export type OrgChartUpdateManyWithoutParentNestedInput = {
    create?: XOR<OrgChartCreateWithoutParentInput, OrgChartUncheckedCreateWithoutParentInput> | OrgChartCreateWithoutParentInput[] | OrgChartUncheckedCreateWithoutParentInput[]
    connectOrCreate?: OrgChartCreateOrConnectWithoutParentInput | OrgChartCreateOrConnectWithoutParentInput[]
    upsert?: OrgChartUpsertWithWhereUniqueWithoutParentInput | OrgChartUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: OrgChartCreateManyParentInputEnvelope
    set?: OrgChartWhereUniqueInput | OrgChartWhereUniqueInput[]
    disconnect?: OrgChartWhereUniqueInput | OrgChartWhereUniqueInput[]
    delete?: OrgChartWhereUniqueInput | OrgChartWhereUniqueInput[]
    connect?: OrgChartWhereUniqueInput | OrgChartWhereUniqueInput[]
    update?: OrgChartUpdateWithWhereUniqueWithoutParentInput | OrgChartUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: OrgChartUpdateManyWithWhereWithoutParentInput | OrgChartUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: OrgChartScalarWhereInput | OrgChartScalarWhereInput[]
  }

  export type UserUpdateOneWithoutOrgNodesNestedInput = {
    create?: XOR<UserCreateWithoutOrgNodesInput, UserUncheckedCreateWithoutOrgNodesInput>
    connectOrCreate?: UserCreateOrConnectWithoutOrgNodesInput
    upsert?: UserUpsertWithoutOrgNodesInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutOrgNodesInput, UserUpdateWithoutOrgNodesInput>, UserUncheckedUpdateWithoutOrgNodesInput>
  }

  export type OrgStructureUpdateOneRequiredWithoutNodesNestedInput = {
    create?: XOR<OrgStructureCreateWithoutNodesInput, OrgStructureUncheckedCreateWithoutNodesInput>
    connectOrCreate?: OrgStructureCreateOrConnectWithoutNodesInput
    upsert?: OrgStructureUpsertWithoutNodesInput
    connect?: OrgStructureWhereUniqueInput
    update?: XOR<XOR<OrgStructureUpdateToOneWithWhereWithoutNodesInput, OrgStructureUpdateWithoutNodesInput>, OrgStructureUncheckedUpdateWithoutNodesInput>
  }

  export type OrgChartUncheckedUpdateManyWithoutParentNestedInput = {
    create?: XOR<OrgChartCreateWithoutParentInput, OrgChartUncheckedCreateWithoutParentInput> | OrgChartCreateWithoutParentInput[] | OrgChartUncheckedCreateWithoutParentInput[]
    connectOrCreate?: OrgChartCreateOrConnectWithoutParentInput | OrgChartCreateOrConnectWithoutParentInput[]
    upsert?: OrgChartUpsertWithWhereUniqueWithoutParentInput | OrgChartUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: OrgChartCreateManyParentInputEnvelope
    set?: OrgChartWhereUniqueInput | OrgChartWhereUniqueInput[]
    disconnect?: OrgChartWhereUniqueInput | OrgChartWhereUniqueInput[]
    delete?: OrgChartWhereUniqueInput | OrgChartWhereUniqueInput[]
    connect?: OrgChartWhereUniqueInput | OrgChartWhereUniqueInput[]
    update?: OrgChartUpdateWithWhereUniqueWithoutParentInput | OrgChartUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: OrgChartUpdateManyWithWhereWithoutParentInput | OrgChartUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: OrgChartScalarWhereInput | OrgChartScalarWhereInput[]
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type UserCreateWithoutCreatedRolesInput = {
    userId: string
    username: string
    password: string
    name: string
    badgeNumber: string
    department?: string | null
    isActive?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    isDeleted?: boolean
    deletedAt?: Date | string | null
    token?: string | null
    creator?: UserCreateNestedOneWithoutCreatedUsersInput
    createdUsers?: UserCreateNestedManyWithoutCreatorInput
    updater?: UserCreateNestedOneWithoutUpdatedUsersInput
    updatedUsers?: UserCreateNestedManyWithoutUpdaterInput
    deleter?: UserCreateNestedOneWithoutDeletedUsersInput
    deletedUsers?: UserCreateNestedManyWithoutDeleterInput
    role: RoleCreateNestedOneWithoutUsersInput
    updatedRoles?: RoleCreateNestedManyWithoutUpdaterInput
    deletedRoles?: RoleCreateNestedManyWithoutDeleterInput
    orgNodes?: OrgChartCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutCreatedRolesInput = {
    userId: string
    username: string
    password: string
    name: string
    badgeNumber: string
    department?: string | null
    isActive?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    roleId: string
    token?: string | null
    createdUsers?: UserUncheckedCreateNestedManyWithoutCreatorInput
    updatedUsers?: UserUncheckedCreateNestedManyWithoutUpdaterInput
    deletedUsers?: UserUncheckedCreateNestedManyWithoutDeleterInput
    updatedRoles?: RoleUncheckedCreateNestedManyWithoutUpdaterInput
    deletedRoles?: RoleUncheckedCreateNestedManyWithoutDeleterInput
    orgNodes?: OrgChartUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutCreatedRolesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCreatedRolesInput, UserUncheckedCreateWithoutCreatedRolesInput>
  }

  export type UserCreateWithoutUpdatedRolesInput = {
    userId: string
    username: string
    password: string
    name: string
    badgeNumber: string
    department?: string | null
    isActive?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    isDeleted?: boolean
    deletedAt?: Date | string | null
    token?: string | null
    creator?: UserCreateNestedOneWithoutCreatedUsersInput
    createdUsers?: UserCreateNestedManyWithoutCreatorInput
    updater?: UserCreateNestedOneWithoutUpdatedUsersInput
    updatedUsers?: UserCreateNestedManyWithoutUpdaterInput
    deleter?: UserCreateNestedOneWithoutDeletedUsersInput
    deletedUsers?: UserCreateNestedManyWithoutDeleterInput
    role: RoleCreateNestedOneWithoutUsersInput
    createdRoles?: RoleCreateNestedManyWithoutCreatorInput
    deletedRoles?: RoleCreateNestedManyWithoutDeleterInput
    orgNodes?: OrgChartCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutUpdatedRolesInput = {
    userId: string
    username: string
    password: string
    name: string
    badgeNumber: string
    department?: string | null
    isActive?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    roleId: string
    token?: string | null
    createdUsers?: UserUncheckedCreateNestedManyWithoutCreatorInput
    updatedUsers?: UserUncheckedCreateNestedManyWithoutUpdaterInput
    deletedUsers?: UserUncheckedCreateNestedManyWithoutDeleterInput
    createdRoles?: RoleUncheckedCreateNestedManyWithoutCreatorInput
    deletedRoles?: RoleUncheckedCreateNestedManyWithoutDeleterInput
    orgNodes?: OrgChartUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutUpdatedRolesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutUpdatedRolesInput, UserUncheckedCreateWithoutUpdatedRolesInput>
  }

  export type UserCreateWithoutDeletedRolesInput = {
    userId: string
    username: string
    password: string
    name: string
    badgeNumber: string
    department?: string | null
    isActive?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    isDeleted?: boolean
    deletedAt?: Date | string | null
    token?: string | null
    creator?: UserCreateNestedOneWithoutCreatedUsersInput
    createdUsers?: UserCreateNestedManyWithoutCreatorInput
    updater?: UserCreateNestedOneWithoutUpdatedUsersInput
    updatedUsers?: UserCreateNestedManyWithoutUpdaterInput
    deleter?: UserCreateNestedOneWithoutDeletedUsersInput
    deletedUsers?: UserCreateNestedManyWithoutDeleterInput
    role: RoleCreateNestedOneWithoutUsersInput
    createdRoles?: RoleCreateNestedManyWithoutCreatorInput
    updatedRoles?: RoleCreateNestedManyWithoutUpdaterInput
    orgNodes?: OrgChartCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutDeletedRolesInput = {
    userId: string
    username: string
    password: string
    name: string
    badgeNumber: string
    department?: string | null
    isActive?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    roleId: string
    token?: string | null
    createdUsers?: UserUncheckedCreateNestedManyWithoutCreatorInput
    updatedUsers?: UserUncheckedCreateNestedManyWithoutUpdaterInput
    deletedUsers?: UserUncheckedCreateNestedManyWithoutDeleterInput
    createdRoles?: RoleUncheckedCreateNestedManyWithoutCreatorInput
    updatedRoles?: RoleUncheckedCreateNestedManyWithoutUpdaterInput
    orgNodes?: OrgChartUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutDeletedRolesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutDeletedRolesInput, UserUncheckedCreateWithoutDeletedRolesInput>
  }

  export type UserCreateWithoutRoleInput = {
    userId: string
    username: string
    password: string
    name: string
    badgeNumber: string
    department?: string | null
    isActive?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    isDeleted?: boolean
    deletedAt?: Date | string | null
    token?: string | null
    creator?: UserCreateNestedOneWithoutCreatedUsersInput
    createdUsers?: UserCreateNestedManyWithoutCreatorInput
    updater?: UserCreateNestedOneWithoutUpdatedUsersInput
    updatedUsers?: UserCreateNestedManyWithoutUpdaterInput
    deleter?: UserCreateNestedOneWithoutDeletedUsersInput
    deletedUsers?: UserCreateNestedManyWithoutDeleterInput
    createdRoles?: RoleCreateNestedManyWithoutCreatorInput
    updatedRoles?: RoleCreateNestedManyWithoutUpdaterInput
    deletedRoles?: RoleCreateNestedManyWithoutDeleterInput
    orgNodes?: OrgChartCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutRoleInput = {
    userId: string
    username: string
    password: string
    name: string
    badgeNumber: string
    department?: string | null
    isActive?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    token?: string | null
    createdUsers?: UserUncheckedCreateNestedManyWithoutCreatorInput
    updatedUsers?: UserUncheckedCreateNestedManyWithoutUpdaterInput
    deletedUsers?: UserUncheckedCreateNestedManyWithoutDeleterInput
    createdRoles?: RoleUncheckedCreateNestedManyWithoutCreatorInput
    updatedRoles?: RoleUncheckedCreateNestedManyWithoutUpdaterInput
    deletedRoles?: RoleUncheckedCreateNestedManyWithoutDeleterInput
    orgNodes?: OrgChartUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutRoleInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutRoleInput, UserUncheckedCreateWithoutRoleInput>
  }

  export type UserCreateManyRoleInputEnvelope = {
    data: UserCreateManyRoleInput | UserCreateManyRoleInput[]
  }

  export type UserUpsertWithoutCreatedRolesInput = {
    update: XOR<UserUpdateWithoutCreatedRolesInput, UserUncheckedUpdateWithoutCreatedRolesInput>
    create: XOR<UserCreateWithoutCreatedRolesInput, UserUncheckedCreateWithoutCreatedRolesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutCreatedRolesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutCreatedRolesInput, UserUncheckedUpdateWithoutCreatedRolesInput>
  }

  export type UserUpdateWithoutCreatedRolesInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    badgeNumber?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    token?: NullableStringFieldUpdateOperationsInput | string | null
    creator?: UserUpdateOneWithoutCreatedUsersNestedInput
    createdUsers?: UserUpdateManyWithoutCreatorNestedInput
    updater?: UserUpdateOneWithoutUpdatedUsersNestedInput
    updatedUsers?: UserUpdateManyWithoutUpdaterNestedInput
    deleter?: UserUpdateOneWithoutDeletedUsersNestedInput
    deletedUsers?: UserUpdateManyWithoutDeleterNestedInput
    role?: RoleUpdateOneRequiredWithoutUsersNestedInput
    updatedRoles?: RoleUpdateManyWithoutUpdaterNestedInput
    deletedRoles?: RoleUpdateManyWithoutDeleterNestedInput
    orgNodes?: OrgChartUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutCreatedRolesInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    badgeNumber?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    roleId?: StringFieldUpdateOperationsInput | string
    token?: NullableStringFieldUpdateOperationsInput | string | null
    createdUsers?: UserUncheckedUpdateManyWithoutCreatorNestedInput
    updatedUsers?: UserUncheckedUpdateManyWithoutUpdaterNestedInput
    deletedUsers?: UserUncheckedUpdateManyWithoutDeleterNestedInput
    updatedRoles?: RoleUncheckedUpdateManyWithoutUpdaterNestedInput
    deletedRoles?: RoleUncheckedUpdateManyWithoutDeleterNestedInput
    orgNodes?: OrgChartUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUpsertWithoutUpdatedRolesInput = {
    update: XOR<UserUpdateWithoutUpdatedRolesInput, UserUncheckedUpdateWithoutUpdatedRolesInput>
    create: XOR<UserCreateWithoutUpdatedRolesInput, UserUncheckedCreateWithoutUpdatedRolesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutUpdatedRolesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutUpdatedRolesInput, UserUncheckedUpdateWithoutUpdatedRolesInput>
  }

  export type UserUpdateWithoutUpdatedRolesInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    badgeNumber?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    token?: NullableStringFieldUpdateOperationsInput | string | null
    creator?: UserUpdateOneWithoutCreatedUsersNestedInput
    createdUsers?: UserUpdateManyWithoutCreatorNestedInput
    updater?: UserUpdateOneWithoutUpdatedUsersNestedInput
    updatedUsers?: UserUpdateManyWithoutUpdaterNestedInput
    deleter?: UserUpdateOneWithoutDeletedUsersNestedInput
    deletedUsers?: UserUpdateManyWithoutDeleterNestedInput
    role?: RoleUpdateOneRequiredWithoutUsersNestedInput
    createdRoles?: RoleUpdateManyWithoutCreatorNestedInput
    deletedRoles?: RoleUpdateManyWithoutDeleterNestedInput
    orgNodes?: OrgChartUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutUpdatedRolesInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    badgeNumber?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    roleId?: StringFieldUpdateOperationsInput | string
    token?: NullableStringFieldUpdateOperationsInput | string | null
    createdUsers?: UserUncheckedUpdateManyWithoutCreatorNestedInput
    updatedUsers?: UserUncheckedUpdateManyWithoutUpdaterNestedInput
    deletedUsers?: UserUncheckedUpdateManyWithoutDeleterNestedInput
    createdRoles?: RoleUncheckedUpdateManyWithoutCreatorNestedInput
    deletedRoles?: RoleUncheckedUpdateManyWithoutDeleterNestedInput
    orgNodes?: OrgChartUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUpsertWithoutDeletedRolesInput = {
    update: XOR<UserUpdateWithoutDeletedRolesInput, UserUncheckedUpdateWithoutDeletedRolesInput>
    create: XOR<UserCreateWithoutDeletedRolesInput, UserUncheckedCreateWithoutDeletedRolesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutDeletedRolesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutDeletedRolesInput, UserUncheckedUpdateWithoutDeletedRolesInput>
  }

  export type UserUpdateWithoutDeletedRolesInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    badgeNumber?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    token?: NullableStringFieldUpdateOperationsInput | string | null
    creator?: UserUpdateOneWithoutCreatedUsersNestedInput
    createdUsers?: UserUpdateManyWithoutCreatorNestedInput
    updater?: UserUpdateOneWithoutUpdatedUsersNestedInput
    updatedUsers?: UserUpdateManyWithoutUpdaterNestedInput
    deleter?: UserUpdateOneWithoutDeletedUsersNestedInput
    deletedUsers?: UserUpdateManyWithoutDeleterNestedInput
    role?: RoleUpdateOneRequiredWithoutUsersNestedInput
    createdRoles?: RoleUpdateManyWithoutCreatorNestedInput
    updatedRoles?: RoleUpdateManyWithoutUpdaterNestedInput
    orgNodes?: OrgChartUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutDeletedRolesInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    badgeNumber?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    roleId?: StringFieldUpdateOperationsInput | string
    token?: NullableStringFieldUpdateOperationsInput | string | null
    createdUsers?: UserUncheckedUpdateManyWithoutCreatorNestedInput
    updatedUsers?: UserUncheckedUpdateManyWithoutUpdaterNestedInput
    deletedUsers?: UserUncheckedUpdateManyWithoutDeleterNestedInput
    createdRoles?: RoleUncheckedUpdateManyWithoutCreatorNestedInput
    updatedRoles?: RoleUncheckedUpdateManyWithoutUpdaterNestedInput
    orgNodes?: OrgChartUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUpsertWithWhereUniqueWithoutRoleInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutRoleInput, UserUncheckedUpdateWithoutRoleInput>
    create: XOR<UserCreateWithoutRoleInput, UserUncheckedCreateWithoutRoleInput>
  }

  export type UserUpdateWithWhereUniqueWithoutRoleInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutRoleInput, UserUncheckedUpdateWithoutRoleInput>
  }

  export type UserUpdateManyWithWhereWithoutRoleInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutRoleInput>
  }

  export type UserScalarWhereInput = {
    AND?: UserScalarWhereInput | UserScalarWhereInput[]
    OR?: UserScalarWhereInput[]
    NOT?: UserScalarWhereInput | UserScalarWhereInput[]
    userId?: StringFilter<"User"> | string
    username?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    badgeNumber?: StringFilter<"User"> | string
    department?: StringNullableFilter<"User"> | string | null
    isActive?: BoolFilter<"User"> | boolean
    lastLogin?: DateTimeNullableFilter<"User"> | Date | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    createdBy?: StringNullableFilter<"User"> | string | null
    updatedAt?: DateTimeFilter<"User"> | Date | string
    updatedBy?: StringNullableFilter<"User"> | string | null
    isDeleted?: BoolFilter<"User"> | boolean
    deletedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    deletedBy?: StringNullableFilter<"User"> | string | null
    roleId?: StringFilter<"User"> | string
    token?: StringNullableFilter<"User"> | string | null
  }

  export type UserCreateWithoutCreatedUsersInput = {
    userId: string
    username: string
    password: string
    name: string
    badgeNumber: string
    department?: string | null
    isActive?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    isDeleted?: boolean
    deletedAt?: Date | string | null
    token?: string | null
    creator?: UserCreateNestedOneWithoutCreatedUsersInput
    updater?: UserCreateNestedOneWithoutUpdatedUsersInput
    updatedUsers?: UserCreateNestedManyWithoutUpdaterInput
    deleter?: UserCreateNestedOneWithoutDeletedUsersInput
    deletedUsers?: UserCreateNestedManyWithoutDeleterInput
    role: RoleCreateNestedOneWithoutUsersInput
    createdRoles?: RoleCreateNestedManyWithoutCreatorInput
    updatedRoles?: RoleCreateNestedManyWithoutUpdaterInput
    deletedRoles?: RoleCreateNestedManyWithoutDeleterInput
    orgNodes?: OrgChartCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutCreatedUsersInput = {
    userId: string
    username: string
    password: string
    name: string
    badgeNumber: string
    department?: string | null
    isActive?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    roleId: string
    token?: string | null
    updatedUsers?: UserUncheckedCreateNestedManyWithoutUpdaterInput
    deletedUsers?: UserUncheckedCreateNestedManyWithoutDeleterInput
    createdRoles?: RoleUncheckedCreateNestedManyWithoutCreatorInput
    updatedRoles?: RoleUncheckedCreateNestedManyWithoutUpdaterInput
    deletedRoles?: RoleUncheckedCreateNestedManyWithoutDeleterInput
    orgNodes?: OrgChartUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutCreatedUsersInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCreatedUsersInput, UserUncheckedCreateWithoutCreatedUsersInput>
  }

  export type UserCreateWithoutCreatorInput = {
    userId: string
    username: string
    password: string
    name: string
    badgeNumber: string
    department?: string | null
    isActive?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    isDeleted?: boolean
    deletedAt?: Date | string | null
    token?: string | null
    createdUsers?: UserCreateNestedManyWithoutCreatorInput
    updater?: UserCreateNestedOneWithoutUpdatedUsersInput
    updatedUsers?: UserCreateNestedManyWithoutUpdaterInput
    deleter?: UserCreateNestedOneWithoutDeletedUsersInput
    deletedUsers?: UserCreateNestedManyWithoutDeleterInput
    role: RoleCreateNestedOneWithoutUsersInput
    createdRoles?: RoleCreateNestedManyWithoutCreatorInput
    updatedRoles?: RoleCreateNestedManyWithoutUpdaterInput
    deletedRoles?: RoleCreateNestedManyWithoutDeleterInput
    orgNodes?: OrgChartCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutCreatorInput = {
    userId: string
    username: string
    password: string
    name: string
    badgeNumber: string
    department?: string | null
    isActive?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    roleId: string
    token?: string | null
    createdUsers?: UserUncheckedCreateNestedManyWithoutCreatorInput
    updatedUsers?: UserUncheckedCreateNestedManyWithoutUpdaterInput
    deletedUsers?: UserUncheckedCreateNestedManyWithoutDeleterInput
    createdRoles?: RoleUncheckedCreateNestedManyWithoutCreatorInput
    updatedRoles?: RoleUncheckedCreateNestedManyWithoutUpdaterInput
    deletedRoles?: RoleUncheckedCreateNestedManyWithoutDeleterInput
    orgNodes?: OrgChartUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutCreatorInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCreatorInput, UserUncheckedCreateWithoutCreatorInput>
  }

  export type UserCreateManyCreatorInputEnvelope = {
    data: UserCreateManyCreatorInput | UserCreateManyCreatorInput[]
  }

  export type UserCreateWithoutUpdatedUsersInput = {
    userId: string
    username: string
    password: string
    name: string
    badgeNumber: string
    department?: string | null
    isActive?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    isDeleted?: boolean
    deletedAt?: Date | string | null
    token?: string | null
    creator?: UserCreateNestedOneWithoutCreatedUsersInput
    createdUsers?: UserCreateNestedManyWithoutCreatorInput
    updater?: UserCreateNestedOneWithoutUpdatedUsersInput
    deleter?: UserCreateNestedOneWithoutDeletedUsersInput
    deletedUsers?: UserCreateNestedManyWithoutDeleterInput
    role: RoleCreateNestedOneWithoutUsersInput
    createdRoles?: RoleCreateNestedManyWithoutCreatorInput
    updatedRoles?: RoleCreateNestedManyWithoutUpdaterInput
    deletedRoles?: RoleCreateNestedManyWithoutDeleterInput
    orgNodes?: OrgChartCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutUpdatedUsersInput = {
    userId: string
    username: string
    password: string
    name: string
    badgeNumber: string
    department?: string | null
    isActive?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    roleId: string
    token?: string | null
    createdUsers?: UserUncheckedCreateNestedManyWithoutCreatorInput
    deletedUsers?: UserUncheckedCreateNestedManyWithoutDeleterInput
    createdRoles?: RoleUncheckedCreateNestedManyWithoutCreatorInput
    updatedRoles?: RoleUncheckedCreateNestedManyWithoutUpdaterInput
    deletedRoles?: RoleUncheckedCreateNestedManyWithoutDeleterInput
    orgNodes?: OrgChartUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutUpdatedUsersInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutUpdatedUsersInput, UserUncheckedCreateWithoutUpdatedUsersInput>
  }

  export type UserCreateWithoutUpdaterInput = {
    userId: string
    username: string
    password: string
    name: string
    badgeNumber: string
    department?: string | null
    isActive?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    isDeleted?: boolean
    deletedAt?: Date | string | null
    token?: string | null
    creator?: UserCreateNestedOneWithoutCreatedUsersInput
    createdUsers?: UserCreateNestedManyWithoutCreatorInput
    updatedUsers?: UserCreateNestedManyWithoutUpdaterInput
    deleter?: UserCreateNestedOneWithoutDeletedUsersInput
    deletedUsers?: UserCreateNestedManyWithoutDeleterInput
    role: RoleCreateNestedOneWithoutUsersInput
    createdRoles?: RoleCreateNestedManyWithoutCreatorInput
    updatedRoles?: RoleCreateNestedManyWithoutUpdaterInput
    deletedRoles?: RoleCreateNestedManyWithoutDeleterInput
    orgNodes?: OrgChartCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutUpdaterInput = {
    userId: string
    username: string
    password: string
    name: string
    badgeNumber: string
    department?: string | null
    isActive?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    roleId: string
    token?: string | null
    createdUsers?: UserUncheckedCreateNestedManyWithoutCreatorInput
    updatedUsers?: UserUncheckedCreateNestedManyWithoutUpdaterInput
    deletedUsers?: UserUncheckedCreateNestedManyWithoutDeleterInput
    createdRoles?: RoleUncheckedCreateNestedManyWithoutCreatorInput
    updatedRoles?: RoleUncheckedCreateNestedManyWithoutUpdaterInput
    deletedRoles?: RoleUncheckedCreateNestedManyWithoutDeleterInput
    orgNodes?: OrgChartUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutUpdaterInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutUpdaterInput, UserUncheckedCreateWithoutUpdaterInput>
  }

  export type UserCreateManyUpdaterInputEnvelope = {
    data: UserCreateManyUpdaterInput | UserCreateManyUpdaterInput[]
  }

  export type UserCreateWithoutDeletedUsersInput = {
    userId: string
    username: string
    password: string
    name: string
    badgeNumber: string
    department?: string | null
    isActive?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    isDeleted?: boolean
    deletedAt?: Date | string | null
    token?: string | null
    creator?: UserCreateNestedOneWithoutCreatedUsersInput
    createdUsers?: UserCreateNestedManyWithoutCreatorInput
    updater?: UserCreateNestedOneWithoutUpdatedUsersInput
    updatedUsers?: UserCreateNestedManyWithoutUpdaterInput
    deleter?: UserCreateNestedOneWithoutDeletedUsersInput
    role: RoleCreateNestedOneWithoutUsersInput
    createdRoles?: RoleCreateNestedManyWithoutCreatorInput
    updatedRoles?: RoleCreateNestedManyWithoutUpdaterInput
    deletedRoles?: RoleCreateNestedManyWithoutDeleterInput
    orgNodes?: OrgChartCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutDeletedUsersInput = {
    userId: string
    username: string
    password: string
    name: string
    badgeNumber: string
    department?: string | null
    isActive?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    roleId: string
    token?: string | null
    createdUsers?: UserUncheckedCreateNestedManyWithoutCreatorInput
    updatedUsers?: UserUncheckedCreateNestedManyWithoutUpdaterInput
    createdRoles?: RoleUncheckedCreateNestedManyWithoutCreatorInput
    updatedRoles?: RoleUncheckedCreateNestedManyWithoutUpdaterInput
    deletedRoles?: RoleUncheckedCreateNestedManyWithoutDeleterInput
    orgNodes?: OrgChartUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutDeletedUsersInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutDeletedUsersInput, UserUncheckedCreateWithoutDeletedUsersInput>
  }

  export type UserCreateWithoutDeleterInput = {
    userId: string
    username: string
    password: string
    name: string
    badgeNumber: string
    department?: string | null
    isActive?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    isDeleted?: boolean
    deletedAt?: Date | string | null
    token?: string | null
    creator?: UserCreateNestedOneWithoutCreatedUsersInput
    createdUsers?: UserCreateNestedManyWithoutCreatorInput
    updater?: UserCreateNestedOneWithoutUpdatedUsersInput
    updatedUsers?: UserCreateNestedManyWithoutUpdaterInput
    deletedUsers?: UserCreateNestedManyWithoutDeleterInput
    role: RoleCreateNestedOneWithoutUsersInput
    createdRoles?: RoleCreateNestedManyWithoutCreatorInput
    updatedRoles?: RoleCreateNestedManyWithoutUpdaterInput
    deletedRoles?: RoleCreateNestedManyWithoutDeleterInput
    orgNodes?: OrgChartCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutDeleterInput = {
    userId: string
    username: string
    password: string
    name: string
    badgeNumber: string
    department?: string | null
    isActive?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    roleId: string
    token?: string | null
    createdUsers?: UserUncheckedCreateNestedManyWithoutCreatorInput
    updatedUsers?: UserUncheckedCreateNestedManyWithoutUpdaterInput
    deletedUsers?: UserUncheckedCreateNestedManyWithoutDeleterInput
    createdRoles?: RoleUncheckedCreateNestedManyWithoutCreatorInput
    updatedRoles?: RoleUncheckedCreateNestedManyWithoutUpdaterInput
    deletedRoles?: RoleUncheckedCreateNestedManyWithoutDeleterInput
    orgNodes?: OrgChartUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutDeleterInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutDeleterInput, UserUncheckedCreateWithoutDeleterInput>
  }

  export type UserCreateManyDeleterInputEnvelope = {
    data: UserCreateManyDeleterInput | UserCreateManyDeleterInput[]
  }

  export type RoleCreateWithoutUsersInput = {
    roleId: string
    roleName: string
    roleLevel: number
    roleDesc?: string | null
    roleIsActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    isDeleted?: boolean
    deletedAt?: Date | string | null
    creator?: UserCreateNestedOneWithoutCreatedRolesInput
    updater?: UserCreateNestedOneWithoutUpdatedRolesInput
    deleter?: UserCreateNestedOneWithoutDeletedRolesInput
  }

  export type RoleUncheckedCreateWithoutUsersInput = {
    roleId: string
    roleName: string
    roleLevel: number
    roleDesc?: string | null
    roleIsActive?: boolean
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
  }

  export type RoleCreateOrConnectWithoutUsersInput = {
    where: RoleWhereUniqueInput
    create: XOR<RoleCreateWithoutUsersInput, RoleUncheckedCreateWithoutUsersInput>
  }

  export type RoleCreateWithoutCreatorInput = {
    roleId: string
    roleName: string
    roleLevel: number
    roleDesc?: string | null
    roleIsActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    isDeleted?: boolean
    deletedAt?: Date | string | null
    updater?: UserCreateNestedOneWithoutUpdatedRolesInput
    deleter?: UserCreateNestedOneWithoutDeletedRolesInput
    users?: UserCreateNestedManyWithoutRoleInput
  }

  export type RoleUncheckedCreateWithoutCreatorInput = {
    roleId: string
    roleName: string
    roleLevel: number
    roleDesc?: string | null
    roleIsActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    users?: UserUncheckedCreateNestedManyWithoutRoleInput
  }

  export type RoleCreateOrConnectWithoutCreatorInput = {
    where: RoleWhereUniqueInput
    create: XOR<RoleCreateWithoutCreatorInput, RoleUncheckedCreateWithoutCreatorInput>
  }

  export type RoleCreateManyCreatorInputEnvelope = {
    data: RoleCreateManyCreatorInput | RoleCreateManyCreatorInput[]
  }

  export type RoleCreateWithoutUpdaterInput = {
    roleId: string
    roleName: string
    roleLevel: number
    roleDesc?: string | null
    roleIsActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    isDeleted?: boolean
    deletedAt?: Date | string | null
    creator?: UserCreateNestedOneWithoutCreatedRolesInput
    deleter?: UserCreateNestedOneWithoutDeletedRolesInput
    users?: UserCreateNestedManyWithoutRoleInput
  }

  export type RoleUncheckedCreateWithoutUpdaterInput = {
    roleId: string
    roleName: string
    roleLevel: number
    roleDesc?: string | null
    roleIsActive?: boolean
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    users?: UserUncheckedCreateNestedManyWithoutRoleInput
  }

  export type RoleCreateOrConnectWithoutUpdaterInput = {
    where: RoleWhereUniqueInput
    create: XOR<RoleCreateWithoutUpdaterInput, RoleUncheckedCreateWithoutUpdaterInput>
  }

  export type RoleCreateManyUpdaterInputEnvelope = {
    data: RoleCreateManyUpdaterInput | RoleCreateManyUpdaterInput[]
  }

  export type RoleCreateWithoutDeleterInput = {
    roleId: string
    roleName: string
    roleLevel: number
    roleDesc?: string | null
    roleIsActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    isDeleted?: boolean
    deletedAt?: Date | string | null
    creator?: UserCreateNestedOneWithoutCreatedRolesInput
    updater?: UserCreateNestedOneWithoutUpdatedRolesInput
    users?: UserCreateNestedManyWithoutRoleInput
  }

  export type RoleUncheckedCreateWithoutDeleterInput = {
    roleId: string
    roleName: string
    roleLevel: number
    roleDesc?: string | null
    roleIsActive?: boolean
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    users?: UserUncheckedCreateNestedManyWithoutRoleInput
  }

  export type RoleCreateOrConnectWithoutDeleterInput = {
    where: RoleWhereUniqueInput
    create: XOR<RoleCreateWithoutDeleterInput, RoleUncheckedCreateWithoutDeleterInput>
  }

  export type RoleCreateManyDeleterInputEnvelope = {
    data: RoleCreateManyDeleterInput | RoleCreateManyDeleterInput[]
  }

  export type OrgChartCreateWithoutUserInput = {
    nodeId: string
    name?: string | null
    position: string
    orderIndex?: number
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    parent?: OrgChartCreateNestedOneWithoutChildrenInput
    children?: OrgChartCreateNestedManyWithoutParentInput
    structure: OrgStructureCreateNestedOneWithoutNodesInput
  }

  export type OrgChartUncheckedCreateWithoutUserInput = {
    nodeId: string
    structureId: string
    parentId?: string | null
    name?: string | null
    position: string
    orderIndex?: number
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    children?: OrgChartUncheckedCreateNestedManyWithoutParentInput
  }

  export type OrgChartCreateOrConnectWithoutUserInput = {
    where: OrgChartWhereUniqueInput
    create: XOR<OrgChartCreateWithoutUserInput, OrgChartUncheckedCreateWithoutUserInput>
  }

  export type OrgChartCreateManyUserInputEnvelope = {
    data: OrgChartCreateManyUserInput | OrgChartCreateManyUserInput[]
  }

  export type UserUpsertWithoutCreatedUsersInput = {
    update: XOR<UserUpdateWithoutCreatedUsersInput, UserUncheckedUpdateWithoutCreatedUsersInput>
    create: XOR<UserCreateWithoutCreatedUsersInput, UserUncheckedCreateWithoutCreatedUsersInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutCreatedUsersInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutCreatedUsersInput, UserUncheckedUpdateWithoutCreatedUsersInput>
  }

  export type UserUpdateWithoutCreatedUsersInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    badgeNumber?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    token?: NullableStringFieldUpdateOperationsInput | string | null
    creator?: UserUpdateOneWithoutCreatedUsersNestedInput
    updater?: UserUpdateOneWithoutUpdatedUsersNestedInput
    updatedUsers?: UserUpdateManyWithoutUpdaterNestedInput
    deleter?: UserUpdateOneWithoutDeletedUsersNestedInput
    deletedUsers?: UserUpdateManyWithoutDeleterNestedInput
    role?: RoleUpdateOneRequiredWithoutUsersNestedInput
    createdRoles?: RoleUpdateManyWithoutCreatorNestedInput
    updatedRoles?: RoleUpdateManyWithoutUpdaterNestedInput
    deletedRoles?: RoleUpdateManyWithoutDeleterNestedInput
    orgNodes?: OrgChartUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutCreatedUsersInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    badgeNumber?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    roleId?: StringFieldUpdateOperationsInput | string
    token?: NullableStringFieldUpdateOperationsInput | string | null
    updatedUsers?: UserUncheckedUpdateManyWithoutUpdaterNestedInput
    deletedUsers?: UserUncheckedUpdateManyWithoutDeleterNestedInput
    createdRoles?: RoleUncheckedUpdateManyWithoutCreatorNestedInput
    updatedRoles?: RoleUncheckedUpdateManyWithoutUpdaterNestedInput
    deletedRoles?: RoleUncheckedUpdateManyWithoutDeleterNestedInput
    orgNodes?: OrgChartUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUpsertWithWhereUniqueWithoutCreatorInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutCreatorInput, UserUncheckedUpdateWithoutCreatorInput>
    create: XOR<UserCreateWithoutCreatorInput, UserUncheckedCreateWithoutCreatorInput>
  }

  export type UserUpdateWithWhereUniqueWithoutCreatorInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutCreatorInput, UserUncheckedUpdateWithoutCreatorInput>
  }

  export type UserUpdateManyWithWhereWithoutCreatorInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutCreatorInput>
  }

  export type UserUpsertWithoutUpdatedUsersInput = {
    update: XOR<UserUpdateWithoutUpdatedUsersInput, UserUncheckedUpdateWithoutUpdatedUsersInput>
    create: XOR<UserCreateWithoutUpdatedUsersInput, UserUncheckedCreateWithoutUpdatedUsersInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutUpdatedUsersInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutUpdatedUsersInput, UserUncheckedUpdateWithoutUpdatedUsersInput>
  }

  export type UserUpdateWithoutUpdatedUsersInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    badgeNumber?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    token?: NullableStringFieldUpdateOperationsInput | string | null
    creator?: UserUpdateOneWithoutCreatedUsersNestedInput
    createdUsers?: UserUpdateManyWithoutCreatorNestedInput
    updater?: UserUpdateOneWithoutUpdatedUsersNestedInput
    deleter?: UserUpdateOneWithoutDeletedUsersNestedInput
    deletedUsers?: UserUpdateManyWithoutDeleterNestedInput
    role?: RoleUpdateOneRequiredWithoutUsersNestedInput
    createdRoles?: RoleUpdateManyWithoutCreatorNestedInput
    updatedRoles?: RoleUpdateManyWithoutUpdaterNestedInput
    deletedRoles?: RoleUpdateManyWithoutDeleterNestedInput
    orgNodes?: OrgChartUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutUpdatedUsersInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    badgeNumber?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    roleId?: StringFieldUpdateOperationsInput | string
    token?: NullableStringFieldUpdateOperationsInput | string | null
    createdUsers?: UserUncheckedUpdateManyWithoutCreatorNestedInput
    deletedUsers?: UserUncheckedUpdateManyWithoutDeleterNestedInput
    createdRoles?: RoleUncheckedUpdateManyWithoutCreatorNestedInput
    updatedRoles?: RoleUncheckedUpdateManyWithoutUpdaterNestedInput
    deletedRoles?: RoleUncheckedUpdateManyWithoutDeleterNestedInput
    orgNodes?: OrgChartUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUpsertWithWhereUniqueWithoutUpdaterInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutUpdaterInput, UserUncheckedUpdateWithoutUpdaterInput>
    create: XOR<UserCreateWithoutUpdaterInput, UserUncheckedCreateWithoutUpdaterInput>
  }

  export type UserUpdateWithWhereUniqueWithoutUpdaterInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutUpdaterInput, UserUncheckedUpdateWithoutUpdaterInput>
  }

  export type UserUpdateManyWithWhereWithoutUpdaterInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutUpdaterInput>
  }

  export type UserUpsertWithoutDeletedUsersInput = {
    update: XOR<UserUpdateWithoutDeletedUsersInput, UserUncheckedUpdateWithoutDeletedUsersInput>
    create: XOR<UserCreateWithoutDeletedUsersInput, UserUncheckedCreateWithoutDeletedUsersInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutDeletedUsersInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutDeletedUsersInput, UserUncheckedUpdateWithoutDeletedUsersInput>
  }

  export type UserUpdateWithoutDeletedUsersInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    badgeNumber?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    token?: NullableStringFieldUpdateOperationsInput | string | null
    creator?: UserUpdateOneWithoutCreatedUsersNestedInput
    createdUsers?: UserUpdateManyWithoutCreatorNestedInput
    updater?: UserUpdateOneWithoutUpdatedUsersNestedInput
    updatedUsers?: UserUpdateManyWithoutUpdaterNestedInput
    deleter?: UserUpdateOneWithoutDeletedUsersNestedInput
    role?: RoleUpdateOneRequiredWithoutUsersNestedInput
    createdRoles?: RoleUpdateManyWithoutCreatorNestedInput
    updatedRoles?: RoleUpdateManyWithoutUpdaterNestedInput
    deletedRoles?: RoleUpdateManyWithoutDeleterNestedInput
    orgNodes?: OrgChartUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutDeletedUsersInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    badgeNumber?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    roleId?: StringFieldUpdateOperationsInput | string
    token?: NullableStringFieldUpdateOperationsInput | string | null
    createdUsers?: UserUncheckedUpdateManyWithoutCreatorNestedInput
    updatedUsers?: UserUncheckedUpdateManyWithoutUpdaterNestedInput
    createdRoles?: RoleUncheckedUpdateManyWithoutCreatorNestedInput
    updatedRoles?: RoleUncheckedUpdateManyWithoutUpdaterNestedInput
    deletedRoles?: RoleUncheckedUpdateManyWithoutDeleterNestedInput
    orgNodes?: OrgChartUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUpsertWithWhereUniqueWithoutDeleterInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutDeleterInput, UserUncheckedUpdateWithoutDeleterInput>
    create: XOR<UserCreateWithoutDeleterInput, UserUncheckedCreateWithoutDeleterInput>
  }

  export type UserUpdateWithWhereUniqueWithoutDeleterInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutDeleterInput, UserUncheckedUpdateWithoutDeleterInput>
  }

  export type UserUpdateManyWithWhereWithoutDeleterInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutDeleterInput>
  }

  export type RoleUpsertWithoutUsersInput = {
    update: XOR<RoleUpdateWithoutUsersInput, RoleUncheckedUpdateWithoutUsersInput>
    create: XOR<RoleCreateWithoutUsersInput, RoleUncheckedCreateWithoutUsersInput>
    where?: RoleWhereInput
  }

  export type RoleUpdateToOneWithWhereWithoutUsersInput = {
    where?: RoleWhereInput
    data: XOR<RoleUpdateWithoutUsersInput, RoleUncheckedUpdateWithoutUsersInput>
  }

  export type RoleUpdateWithoutUsersInput = {
    roleId?: StringFieldUpdateOperationsInput | string
    roleName?: StringFieldUpdateOperationsInput | string
    roleLevel?: IntFieldUpdateOperationsInput | number
    roleDesc?: NullableStringFieldUpdateOperationsInput | string | null
    roleIsActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    creator?: UserUpdateOneWithoutCreatedRolesNestedInput
    updater?: UserUpdateOneWithoutUpdatedRolesNestedInput
    deleter?: UserUpdateOneWithoutDeletedRolesNestedInput
  }

  export type RoleUncheckedUpdateWithoutUsersInput = {
    roleId?: StringFieldUpdateOperationsInput | string
    roleName?: StringFieldUpdateOperationsInput | string
    roleLevel?: IntFieldUpdateOperationsInput | number
    roleDesc?: NullableStringFieldUpdateOperationsInput | string | null
    roleIsActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RoleUpsertWithWhereUniqueWithoutCreatorInput = {
    where: RoleWhereUniqueInput
    update: XOR<RoleUpdateWithoutCreatorInput, RoleUncheckedUpdateWithoutCreatorInput>
    create: XOR<RoleCreateWithoutCreatorInput, RoleUncheckedCreateWithoutCreatorInput>
  }

  export type RoleUpdateWithWhereUniqueWithoutCreatorInput = {
    where: RoleWhereUniqueInput
    data: XOR<RoleUpdateWithoutCreatorInput, RoleUncheckedUpdateWithoutCreatorInput>
  }

  export type RoleUpdateManyWithWhereWithoutCreatorInput = {
    where: RoleScalarWhereInput
    data: XOR<RoleUpdateManyMutationInput, RoleUncheckedUpdateManyWithoutCreatorInput>
  }

  export type RoleScalarWhereInput = {
    AND?: RoleScalarWhereInput | RoleScalarWhereInput[]
    OR?: RoleScalarWhereInput[]
    NOT?: RoleScalarWhereInput | RoleScalarWhereInput[]
    roleId?: StringFilter<"Role"> | string
    roleName?: StringFilter<"Role"> | string
    roleLevel?: IntFilter<"Role"> | number
    roleDesc?: StringNullableFilter<"Role"> | string | null
    roleIsActive?: BoolFilter<"Role"> | boolean
    createdAt?: DateTimeFilter<"Role"> | Date | string
    createdBy?: StringNullableFilter<"Role"> | string | null
    updatedAt?: DateTimeFilter<"Role"> | Date | string
    updatedBy?: StringNullableFilter<"Role"> | string | null
    isDeleted?: BoolFilter<"Role"> | boolean
    deletedAt?: DateTimeNullableFilter<"Role"> | Date | string | null
    deletedBy?: StringNullableFilter<"Role"> | string | null
  }

  export type RoleUpsertWithWhereUniqueWithoutUpdaterInput = {
    where: RoleWhereUniqueInput
    update: XOR<RoleUpdateWithoutUpdaterInput, RoleUncheckedUpdateWithoutUpdaterInput>
    create: XOR<RoleCreateWithoutUpdaterInput, RoleUncheckedCreateWithoutUpdaterInput>
  }

  export type RoleUpdateWithWhereUniqueWithoutUpdaterInput = {
    where: RoleWhereUniqueInput
    data: XOR<RoleUpdateWithoutUpdaterInput, RoleUncheckedUpdateWithoutUpdaterInput>
  }

  export type RoleUpdateManyWithWhereWithoutUpdaterInput = {
    where: RoleScalarWhereInput
    data: XOR<RoleUpdateManyMutationInput, RoleUncheckedUpdateManyWithoutUpdaterInput>
  }

  export type RoleUpsertWithWhereUniqueWithoutDeleterInput = {
    where: RoleWhereUniqueInput
    update: XOR<RoleUpdateWithoutDeleterInput, RoleUncheckedUpdateWithoutDeleterInput>
    create: XOR<RoleCreateWithoutDeleterInput, RoleUncheckedCreateWithoutDeleterInput>
  }

  export type RoleUpdateWithWhereUniqueWithoutDeleterInput = {
    where: RoleWhereUniqueInput
    data: XOR<RoleUpdateWithoutDeleterInput, RoleUncheckedUpdateWithoutDeleterInput>
  }

  export type RoleUpdateManyWithWhereWithoutDeleterInput = {
    where: RoleScalarWhereInput
    data: XOR<RoleUpdateManyMutationInput, RoleUncheckedUpdateManyWithoutDeleterInput>
  }

  export type OrgChartUpsertWithWhereUniqueWithoutUserInput = {
    where: OrgChartWhereUniqueInput
    update: XOR<OrgChartUpdateWithoutUserInput, OrgChartUncheckedUpdateWithoutUserInput>
    create: XOR<OrgChartCreateWithoutUserInput, OrgChartUncheckedCreateWithoutUserInput>
  }

  export type OrgChartUpdateWithWhereUniqueWithoutUserInput = {
    where: OrgChartWhereUniqueInput
    data: XOR<OrgChartUpdateWithoutUserInput, OrgChartUncheckedUpdateWithoutUserInput>
  }

  export type OrgChartUpdateManyWithWhereWithoutUserInput = {
    where: OrgChartScalarWhereInput
    data: XOR<OrgChartUpdateManyMutationInput, OrgChartUncheckedUpdateManyWithoutUserInput>
  }

  export type OrgChartScalarWhereInput = {
    AND?: OrgChartScalarWhereInput | OrgChartScalarWhereInput[]
    OR?: OrgChartScalarWhereInput[]
    NOT?: OrgChartScalarWhereInput | OrgChartScalarWhereInput[]
    nodeId?: StringFilter<"OrgChart"> | string
    structureId?: StringFilter<"OrgChart"> | string
    userId?: StringNullableFilter<"OrgChart"> | string | null
    parentId?: StringNullableFilter<"OrgChart"> | string | null
    name?: StringNullableFilter<"OrgChart"> | string | null
    position?: StringFilter<"OrgChart"> | string
    orderIndex?: IntFilter<"OrgChart"> | number
    createdAt?: DateTimeFilter<"OrgChart"> | Date | string
    createdBy?: StringNullableFilter<"OrgChart"> | string | null
    updatedAt?: DateTimeFilter<"OrgChart"> | Date | string
    updatedBy?: StringNullableFilter<"OrgChart"> | string | null
    isDeleted?: BoolFilter<"OrgChart"> | boolean
    deletedAt?: DateTimeNullableFilter<"OrgChart"> | Date | string | null
    deletedBy?: StringNullableFilter<"OrgChart"> | string | null
  }

  export type OrgChartCreateWithoutStructureInput = {
    nodeId: string
    name?: string | null
    position: string
    orderIndex?: number
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    parent?: OrgChartCreateNestedOneWithoutChildrenInput
    children?: OrgChartCreateNestedManyWithoutParentInput
    user?: UserCreateNestedOneWithoutOrgNodesInput
  }

  export type OrgChartUncheckedCreateWithoutStructureInput = {
    nodeId: string
    userId?: string | null
    parentId?: string | null
    name?: string | null
    position: string
    orderIndex?: number
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    children?: OrgChartUncheckedCreateNestedManyWithoutParentInput
  }

  export type OrgChartCreateOrConnectWithoutStructureInput = {
    where: OrgChartWhereUniqueInput
    create: XOR<OrgChartCreateWithoutStructureInput, OrgChartUncheckedCreateWithoutStructureInput>
  }

  export type OrgChartCreateManyStructureInputEnvelope = {
    data: OrgChartCreateManyStructureInput | OrgChartCreateManyStructureInput[]
  }

  export type OrgChartUpsertWithWhereUniqueWithoutStructureInput = {
    where: OrgChartWhereUniqueInput
    update: XOR<OrgChartUpdateWithoutStructureInput, OrgChartUncheckedUpdateWithoutStructureInput>
    create: XOR<OrgChartCreateWithoutStructureInput, OrgChartUncheckedCreateWithoutStructureInput>
  }

  export type OrgChartUpdateWithWhereUniqueWithoutStructureInput = {
    where: OrgChartWhereUniqueInput
    data: XOR<OrgChartUpdateWithoutStructureInput, OrgChartUncheckedUpdateWithoutStructureInput>
  }

  export type OrgChartUpdateManyWithWhereWithoutStructureInput = {
    where: OrgChartScalarWhereInput
    data: XOR<OrgChartUpdateManyMutationInput, OrgChartUncheckedUpdateManyWithoutStructureInput>
  }

  export type OrgChartCreateWithoutChildrenInput = {
    nodeId: string
    name?: string | null
    position: string
    orderIndex?: number
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    parent?: OrgChartCreateNestedOneWithoutChildrenInput
    user?: UserCreateNestedOneWithoutOrgNodesInput
    structure: OrgStructureCreateNestedOneWithoutNodesInput
  }

  export type OrgChartUncheckedCreateWithoutChildrenInput = {
    nodeId: string
    structureId: string
    userId?: string | null
    parentId?: string | null
    name?: string | null
    position: string
    orderIndex?: number
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
  }

  export type OrgChartCreateOrConnectWithoutChildrenInput = {
    where: OrgChartWhereUniqueInput
    create: XOR<OrgChartCreateWithoutChildrenInput, OrgChartUncheckedCreateWithoutChildrenInput>
  }

  export type OrgChartCreateWithoutParentInput = {
    nodeId: string
    name?: string | null
    position: string
    orderIndex?: number
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    children?: OrgChartCreateNestedManyWithoutParentInput
    user?: UserCreateNestedOneWithoutOrgNodesInput
    structure: OrgStructureCreateNestedOneWithoutNodesInput
  }

  export type OrgChartUncheckedCreateWithoutParentInput = {
    nodeId: string
    structureId: string
    userId?: string | null
    name?: string | null
    position: string
    orderIndex?: number
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    children?: OrgChartUncheckedCreateNestedManyWithoutParentInput
  }

  export type OrgChartCreateOrConnectWithoutParentInput = {
    where: OrgChartWhereUniqueInput
    create: XOR<OrgChartCreateWithoutParentInput, OrgChartUncheckedCreateWithoutParentInput>
  }

  export type OrgChartCreateManyParentInputEnvelope = {
    data: OrgChartCreateManyParentInput | OrgChartCreateManyParentInput[]
  }

  export type UserCreateWithoutOrgNodesInput = {
    userId: string
    username: string
    password: string
    name: string
    badgeNumber: string
    department?: string | null
    isActive?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    isDeleted?: boolean
    deletedAt?: Date | string | null
    token?: string | null
    creator?: UserCreateNestedOneWithoutCreatedUsersInput
    createdUsers?: UserCreateNestedManyWithoutCreatorInput
    updater?: UserCreateNestedOneWithoutUpdatedUsersInput
    updatedUsers?: UserCreateNestedManyWithoutUpdaterInput
    deleter?: UserCreateNestedOneWithoutDeletedUsersInput
    deletedUsers?: UserCreateNestedManyWithoutDeleterInput
    role: RoleCreateNestedOneWithoutUsersInput
    createdRoles?: RoleCreateNestedManyWithoutCreatorInput
    updatedRoles?: RoleCreateNestedManyWithoutUpdaterInput
    deletedRoles?: RoleCreateNestedManyWithoutDeleterInput
  }

  export type UserUncheckedCreateWithoutOrgNodesInput = {
    userId: string
    username: string
    password: string
    name: string
    badgeNumber: string
    department?: string | null
    isActive?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    roleId: string
    token?: string | null
    createdUsers?: UserUncheckedCreateNestedManyWithoutCreatorInput
    updatedUsers?: UserUncheckedCreateNestedManyWithoutUpdaterInput
    deletedUsers?: UserUncheckedCreateNestedManyWithoutDeleterInput
    createdRoles?: RoleUncheckedCreateNestedManyWithoutCreatorInput
    updatedRoles?: RoleUncheckedCreateNestedManyWithoutUpdaterInput
    deletedRoles?: RoleUncheckedCreateNestedManyWithoutDeleterInput
  }

  export type UserCreateOrConnectWithoutOrgNodesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutOrgNodesInput, UserUncheckedCreateWithoutOrgNodesInput>
  }

  export type OrgStructureCreateWithoutNodesInput = {
    structureId: string
    name: string
    description?: string | null
    rootNodeId?: string | null
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
  }

  export type OrgStructureUncheckedCreateWithoutNodesInput = {
    structureId: string
    name: string
    description?: string | null
    rootNodeId?: string | null
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
  }

  export type OrgStructureCreateOrConnectWithoutNodesInput = {
    where: OrgStructureWhereUniqueInput
    create: XOR<OrgStructureCreateWithoutNodesInput, OrgStructureUncheckedCreateWithoutNodesInput>
  }

  export type OrgChartUpsertWithoutChildrenInput = {
    update: XOR<OrgChartUpdateWithoutChildrenInput, OrgChartUncheckedUpdateWithoutChildrenInput>
    create: XOR<OrgChartCreateWithoutChildrenInput, OrgChartUncheckedCreateWithoutChildrenInput>
    where?: OrgChartWhereInput
  }

  export type OrgChartUpdateToOneWithWhereWithoutChildrenInput = {
    where?: OrgChartWhereInput
    data: XOR<OrgChartUpdateWithoutChildrenInput, OrgChartUncheckedUpdateWithoutChildrenInput>
  }

  export type OrgChartUpdateWithoutChildrenInput = {
    nodeId?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    orderIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    parent?: OrgChartUpdateOneWithoutChildrenNestedInput
    user?: UserUpdateOneWithoutOrgNodesNestedInput
    structure?: OrgStructureUpdateOneRequiredWithoutNodesNestedInput
  }

  export type OrgChartUncheckedUpdateWithoutChildrenInput = {
    nodeId?: StringFieldUpdateOperationsInput | string
    structureId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    orderIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OrgChartUpsertWithWhereUniqueWithoutParentInput = {
    where: OrgChartWhereUniqueInput
    update: XOR<OrgChartUpdateWithoutParentInput, OrgChartUncheckedUpdateWithoutParentInput>
    create: XOR<OrgChartCreateWithoutParentInput, OrgChartUncheckedCreateWithoutParentInput>
  }

  export type OrgChartUpdateWithWhereUniqueWithoutParentInput = {
    where: OrgChartWhereUniqueInput
    data: XOR<OrgChartUpdateWithoutParentInput, OrgChartUncheckedUpdateWithoutParentInput>
  }

  export type OrgChartUpdateManyWithWhereWithoutParentInput = {
    where: OrgChartScalarWhereInput
    data: XOR<OrgChartUpdateManyMutationInput, OrgChartUncheckedUpdateManyWithoutParentInput>
  }

  export type UserUpsertWithoutOrgNodesInput = {
    update: XOR<UserUpdateWithoutOrgNodesInput, UserUncheckedUpdateWithoutOrgNodesInput>
    create: XOR<UserCreateWithoutOrgNodesInput, UserUncheckedCreateWithoutOrgNodesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutOrgNodesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutOrgNodesInput, UserUncheckedUpdateWithoutOrgNodesInput>
  }

  export type UserUpdateWithoutOrgNodesInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    badgeNumber?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    token?: NullableStringFieldUpdateOperationsInput | string | null
    creator?: UserUpdateOneWithoutCreatedUsersNestedInput
    createdUsers?: UserUpdateManyWithoutCreatorNestedInput
    updater?: UserUpdateOneWithoutUpdatedUsersNestedInput
    updatedUsers?: UserUpdateManyWithoutUpdaterNestedInput
    deleter?: UserUpdateOneWithoutDeletedUsersNestedInput
    deletedUsers?: UserUpdateManyWithoutDeleterNestedInput
    role?: RoleUpdateOneRequiredWithoutUsersNestedInput
    createdRoles?: RoleUpdateManyWithoutCreatorNestedInput
    updatedRoles?: RoleUpdateManyWithoutUpdaterNestedInput
    deletedRoles?: RoleUpdateManyWithoutDeleterNestedInput
  }

  export type UserUncheckedUpdateWithoutOrgNodesInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    badgeNumber?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    roleId?: StringFieldUpdateOperationsInput | string
    token?: NullableStringFieldUpdateOperationsInput | string | null
    createdUsers?: UserUncheckedUpdateManyWithoutCreatorNestedInput
    updatedUsers?: UserUncheckedUpdateManyWithoutUpdaterNestedInput
    deletedUsers?: UserUncheckedUpdateManyWithoutDeleterNestedInput
    createdRoles?: RoleUncheckedUpdateManyWithoutCreatorNestedInput
    updatedRoles?: RoleUncheckedUpdateManyWithoutUpdaterNestedInput
    deletedRoles?: RoleUncheckedUpdateManyWithoutDeleterNestedInput
  }

  export type OrgStructureUpsertWithoutNodesInput = {
    update: XOR<OrgStructureUpdateWithoutNodesInput, OrgStructureUncheckedUpdateWithoutNodesInput>
    create: XOR<OrgStructureCreateWithoutNodesInput, OrgStructureUncheckedCreateWithoutNodesInput>
    where?: OrgStructureWhereInput
  }

  export type OrgStructureUpdateToOneWithWhereWithoutNodesInput = {
    where?: OrgStructureWhereInput
    data: XOR<OrgStructureUpdateWithoutNodesInput, OrgStructureUncheckedUpdateWithoutNodesInput>
  }

  export type OrgStructureUpdateWithoutNodesInput = {
    structureId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    rootNodeId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OrgStructureUncheckedUpdateWithoutNodesInput = {
    structureId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    rootNodeId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserCreateManyRoleInput = {
    userId: string
    username: string
    password: string
    name: string
    badgeNumber: string
    department?: string | null
    isActive?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    token?: string | null
  }

  export type UserUpdateWithoutRoleInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    badgeNumber?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    token?: NullableStringFieldUpdateOperationsInput | string | null
    creator?: UserUpdateOneWithoutCreatedUsersNestedInput
    createdUsers?: UserUpdateManyWithoutCreatorNestedInput
    updater?: UserUpdateOneWithoutUpdatedUsersNestedInput
    updatedUsers?: UserUpdateManyWithoutUpdaterNestedInput
    deleter?: UserUpdateOneWithoutDeletedUsersNestedInput
    deletedUsers?: UserUpdateManyWithoutDeleterNestedInput
    createdRoles?: RoleUpdateManyWithoutCreatorNestedInput
    updatedRoles?: RoleUpdateManyWithoutUpdaterNestedInput
    deletedRoles?: RoleUpdateManyWithoutDeleterNestedInput
    orgNodes?: OrgChartUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutRoleInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    badgeNumber?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    token?: NullableStringFieldUpdateOperationsInput | string | null
    createdUsers?: UserUncheckedUpdateManyWithoutCreatorNestedInput
    updatedUsers?: UserUncheckedUpdateManyWithoutUpdaterNestedInput
    deletedUsers?: UserUncheckedUpdateManyWithoutDeleterNestedInput
    createdRoles?: RoleUncheckedUpdateManyWithoutCreatorNestedInput
    updatedRoles?: RoleUncheckedUpdateManyWithoutUpdaterNestedInput
    deletedRoles?: RoleUncheckedUpdateManyWithoutDeleterNestedInput
    orgNodes?: OrgChartUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateManyWithoutRoleInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    badgeNumber?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    token?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserCreateManyCreatorInput = {
    userId: string
    username: string
    password: string
    name: string
    badgeNumber: string
    department?: string | null
    isActive?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    roleId: string
    token?: string | null
  }

  export type UserCreateManyUpdaterInput = {
    userId: string
    username: string
    password: string
    name: string
    badgeNumber: string
    department?: string | null
    isActive?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    roleId: string
    token?: string | null
  }

  export type UserCreateManyDeleterInput = {
    userId: string
    username: string
    password: string
    name: string
    badgeNumber: string
    department?: string | null
    isActive?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    roleId: string
    token?: string | null
  }

  export type RoleCreateManyCreatorInput = {
    roleId: string
    roleName: string
    roleLevel: number
    roleDesc?: string | null
    roleIsActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
  }

  export type RoleCreateManyUpdaterInput = {
    roleId: string
    roleName: string
    roleLevel: number
    roleDesc?: string | null
    roleIsActive?: boolean
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
  }

  export type RoleCreateManyDeleterInput = {
    roleId: string
    roleName: string
    roleLevel: number
    roleDesc?: string | null
    roleIsActive?: boolean
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
  }

  export type OrgChartCreateManyUserInput = {
    nodeId: string
    structureId: string
    parentId?: string | null
    name?: string | null
    position: string
    orderIndex?: number
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
  }

  export type UserUpdateWithoutCreatorInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    badgeNumber?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    token?: NullableStringFieldUpdateOperationsInput | string | null
    createdUsers?: UserUpdateManyWithoutCreatorNestedInput
    updater?: UserUpdateOneWithoutUpdatedUsersNestedInput
    updatedUsers?: UserUpdateManyWithoutUpdaterNestedInput
    deleter?: UserUpdateOneWithoutDeletedUsersNestedInput
    deletedUsers?: UserUpdateManyWithoutDeleterNestedInput
    role?: RoleUpdateOneRequiredWithoutUsersNestedInput
    createdRoles?: RoleUpdateManyWithoutCreatorNestedInput
    updatedRoles?: RoleUpdateManyWithoutUpdaterNestedInput
    deletedRoles?: RoleUpdateManyWithoutDeleterNestedInput
    orgNodes?: OrgChartUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutCreatorInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    badgeNumber?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    roleId?: StringFieldUpdateOperationsInput | string
    token?: NullableStringFieldUpdateOperationsInput | string | null
    createdUsers?: UserUncheckedUpdateManyWithoutCreatorNestedInput
    updatedUsers?: UserUncheckedUpdateManyWithoutUpdaterNestedInput
    deletedUsers?: UserUncheckedUpdateManyWithoutDeleterNestedInput
    createdRoles?: RoleUncheckedUpdateManyWithoutCreatorNestedInput
    updatedRoles?: RoleUncheckedUpdateManyWithoutUpdaterNestedInput
    deletedRoles?: RoleUncheckedUpdateManyWithoutDeleterNestedInput
    orgNodes?: OrgChartUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateManyWithoutCreatorInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    badgeNumber?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    roleId?: StringFieldUpdateOperationsInput | string
    token?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserUpdateWithoutUpdaterInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    badgeNumber?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    token?: NullableStringFieldUpdateOperationsInput | string | null
    creator?: UserUpdateOneWithoutCreatedUsersNestedInput
    createdUsers?: UserUpdateManyWithoutCreatorNestedInput
    updatedUsers?: UserUpdateManyWithoutUpdaterNestedInput
    deleter?: UserUpdateOneWithoutDeletedUsersNestedInput
    deletedUsers?: UserUpdateManyWithoutDeleterNestedInput
    role?: RoleUpdateOneRequiredWithoutUsersNestedInput
    createdRoles?: RoleUpdateManyWithoutCreatorNestedInput
    updatedRoles?: RoleUpdateManyWithoutUpdaterNestedInput
    deletedRoles?: RoleUpdateManyWithoutDeleterNestedInput
    orgNodes?: OrgChartUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutUpdaterInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    badgeNumber?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    roleId?: StringFieldUpdateOperationsInput | string
    token?: NullableStringFieldUpdateOperationsInput | string | null
    createdUsers?: UserUncheckedUpdateManyWithoutCreatorNestedInput
    updatedUsers?: UserUncheckedUpdateManyWithoutUpdaterNestedInput
    deletedUsers?: UserUncheckedUpdateManyWithoutDeleterNestedInput
    createdRoles?: RoleUncheckedUpdateManyWithoutCreatorNestedInput
    updatedRoles?: RoleUncheckedUpdateManyWithoutUpdaterNestedInput
    deletedRoles?: RoleUncheckedUpdateManyWithoutDeleterNestedInput
    orgNodes?: OrgChartUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateManyWithoutUpdaterInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    badgeNumber?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    roleId?: StringFieldUpdateOperationsInput | string
    token?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserUpdateWithoutDeleterInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    badgeNumber?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    token?: NullableStringFieldUpdateOperationsInput | string | null
    creator?: UserUpdateOneWithoutCreatedUsersNestedInput
    createdUsers?: UserUpdateManyWithoutCreatorNestedInput
    updater?: UserUpdateOneWithoutUpdatedUsersNestedInput
    updatedUsers?: UserUpdateManyWithoutUpdaterNestedInput
    deletedUsers?: UserUpdateManyWithoutDeleterNestedInput
    role?: RoleUpdateOneRequiredWithoutUsersNestedInput
    createdRoles?: RoleUpdateManyWithoutCreatorNestedInput
    updatedRoles?: RoleUpdateManyWithoutUpdaterNestedInput
    deletedRoles?: RoleUpdateManyWithoutDeleterNestedInput
    orgNodes?: OrgChartUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutDeleterInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    badgeNumber?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    roleId?: StringFieldUpdateOperationsInput | string
    token?: NullableStringFieldUpdateOperationsInput | string | null
    createdUsers?: UserUncheckedUpdateManyWithoutCreatorNestedInput
    updatedUsers?: UserUncheckedUpdateManyWithoutUpdaterNestedInput
    deletedUsers?: UserUncheckedUpdateManyWithoutDeleterNestedInput
    createdRoles?: RoleUncheckedUpdateManyWithoutCreatorNestedInput
    updatedRoles?: RoleUncheckedUpdateManyWithoutUpdaterNestedInput
    deletedRoles?: RoleUncheckedUpdateManyWithoutDeleterNestedInput
    orgNodes?: OrgChartUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateManyWithoutDeleterInput = {
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    badgeNumber?: StringFieldUpdateOperationsInput | string
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    roleId?: StringFieldUpdateOperationsInput | string
    token?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RoleUpdateWithoutCreatorInput = {
    roleId?: StringFieldUpdateOperationsInput | string
    roleName?: StringFieldUpdateOperationsInput | string
    roleLevel?: IntFieldUpdateOperationsInput | number
    roleDesc?: NullableStringFieldUpdateOperationsInput | string | null
    roleIsActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updater?: UserUpdateOneWithoutUpdatedRolesNestedInput
    deleter?: UserUpdateOneWithoutDeletedRolesNestedInput
    users?: UserUpdateManyWithoutRoleNestedInput
  }

  export type RoleUncheckedUpdateWithoutCreatorInput = {
    roleId?: StringFieldUpdateOperationsInput | string
    roleName?: StringFieldUpdateOperationsInput | string
    roleLevel?: IntFieldUpdateOperationsInput | number
    roleDesc?: NullableStringFieldUpdateOperationsInput | string | null
    roleIsActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    users?: UserUncheckedUpdateManyWithoutRoleNestedInput
  }

  export type RoleUncheckedUpdateManyWithoutCreatorInput = {
    roleId?: StringFieldUpdateOperationsInput | string
    roleName?: StringFieldUpdateOperationsInput | string
    roleLevel?: IntFieldUpdateOperationsInput | number
    roleDesc?: NullableStringFieldUpdateOperationsInput | string | null
    roleIsActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RoleUpdateWithoutUpdaterInput = {
    roleId?: StringFieldUpdateOperationsInput | string
    roleName?: StringFieldUpdateOperationsInput | string
    roleLevel?: IntFieldUpdateOperationsInput | number
    roleDesc?: NullableStringFieldUpdateOperationsInput | string | null
    roleIsActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    creator?: UserUpdateOneWithoutCreatedRolesNestedInput
    deleter?: UserUpdateOneWithoutDeletedRolesNestedInput
    users?: UserUpdateManyWithoutRoleNestedInput
  }

  export type RoleUncheckedUpdateWithoutUpdaterInput = {
    roleId?: StringFieldUpdateOperationsInput | string
    roleName?: StringFieldUpdateOperationsInput | string
    roleLevel?: IntFieldUpdateOperationsInput | number
    roleDesc?: NullableStringFieldUpdateOperationsInput | string | null
    roleIsActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    users?: UserUncheckedUpdateManyWithoutRoleNestedInput
  }

  export type RoleUncheckedUpdateManyWithoutUpdaterInput = {
    roleId?: StringFieldUpdateOperationsInput | string
    roleName?: StringFieldUpdateOperationsInput | string
    roleLevel?: IntFieldUpdateOperationsInput | number
    roleDesc?: NullableStringFieldUpdateOperationsInput | string | null
    roleIsActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RoleUpdateWithoutDeleterInput = {
    roleId?: StringFieldUpdateOperationsInput | string
    roleName?: StringFieldUpdateOperationsInput | string
    roleLevel?: IntFieldUpdateOperationsInput | number
    roleDesc?: NullableStringFieldUpdateOperationsInput | string | null
    roleIsActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    creator?: UserUpdateOneWithoutCreatedRolesNestedInput
    updater?: UserUpdateOneWithoutUpdatedRolesNestedInput
    users?: UserUpdateManyWithoutRoleNestedInput
  }

  export type RoleUncheckedUpdateWithoutDeleterInput = {
    roleId?: StringFieldUpdateOperationsInput | string
    roleName?: StringFieldUpdateOperationsInput | string
    roleLevel?: IntFieldUpdateOperationsInput | number
    roleDesc?: NullableStringFieldUpdateOperationsInput | string | null
    roleIsActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    users?: UserUncheckedUpdateManyWithoutRoleNestedInput
  }

  export type RoleUncheckedUpdateManyWithoutDeleterInput = {
    roleId?: StringFieldUpdateOperationsInput | string
    roleName?: StringFieldUpdateOperationsInput | string
    roleLevel?: IntFieldUpdateOperationsInput | number
    roleDesc?: NullableStringFieldUpdateOperationsInput | string | null
    roleIsActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type OrgChartUpdateWithoutUserInput = {
    nodeId?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    orderIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    parent?: OrgChartUpdateOneWithoutChildrenNestedInput
    children?: OrgChartUpdateManyWithoutParentNestedInput
    structure?: OrgStructureUpdateOneRequiredWithoutNodesNestedInput
  }

  export type OrgChartUncheckedUpdateWithoutUserInput = {
    nodeId?: StringFieldUpdateOperationsInput | string
    structureId?: StringFieldUpdateOperationsInput | string
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    orderIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    children?: OrgChartUncheckedUpdateManyWithoutParentNestedInput
  }

  export type OrgChartUncheckedUpdateManyWithoutUserInput = {
    nodeId?: StringFieldUpdateOperationsInput | string
    structureId?: StringFieldUpdateOperationsInput | string
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    orderIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OrgChartCreateManyStructureInput = {
    nodeId: string
    userId?: string | null
    parentId?: string | null
    name?: string | null
    position: string
    orderIndex?: number
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
  }

  export type OrgChartUpdateWithoutStructureInput = {
    nodeId?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    orderIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    parent?: OrgChartUpdateOneWithoutChildrenNestedInput
    children?: OrgChartUpdateManyWithoutParentNestedInput
    user?: UserUpdateOneWithoutOrgNodesNestedInput
  }

  export type OrgChartUncheckedUpdateWithoutStructureInput = {
    nodeId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    orderIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    children?: OrgChartUncheckedUpdateManyWithoutParentNestedInput
  }

  export type OrgChartUncheckedUpdateManyWithoutStructureInput = {
    nodeId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    orderIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OrgChartCreateManyParentInput = {
    nodeId: string
    structureId: string
    userId?: string | null
    name?: string | null
    position: string
    orderIndex?: number
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
  }

  export type OrgChartUpdateWithoutParentInput = {
    nodeId?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    orderIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    children?: OrgChartUpdateManyWithoutParentNestedInput
    user?: UserUpdateOneWithoutOrgNodesNestedInput
    structure?: OrgStructureUpdateOneRequiredWithoutNodesNestedInput
  }

  export type OrgChartUncheckedUpdateWithoutParentInput = {
    nodeId?: StringFieldUpdateOperationsInput | string
    structureId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    orderIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    children?: OrgChartUncheckedUpdateManyWithoutParentNestedInput
  }

  export type OrgChartUncheckedUpdateManyWithoutParentInput = {
    nodeId?: StringFieldUpdateOperationsInput | string
    structureId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    orderIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}