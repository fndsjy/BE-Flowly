
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
 * Model Chart
 * 
 */
export type Chart = $Result.DefaultSelection<Prisma.$ChartPayload>
/**
 * Model ChartMember
 * 
 */
export type ChartMember = $Result.DefaultSelection<Prisma.$ChartMemberPayload>
/**
 * Model jabatan
 * The underlying table does not contain a valid unique identifier and can therefore currently not be handled by Prisma Client.
 */
export type jabatan = $Result.DefaultSelection<Prisma.$jabatanPayload>
/**
 * Model AccessRole
 * Access rules for per-user or role permissions
 */
export type AccessRole = $Result.DefaultSelection<Prisma.$AccessRolePayload>
/**
 * Model MasterAccessRole
 * Resource catalog for menu/module definitions
 */
export type MasterAccessRole = $Result.DefaultSelection<Prisma.$MasterAccessRolePayload>

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
   * `prisma.chart`: Exposes CRUD operations for the **Chart** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Charts
    * const charts = await prisma.chart.findMany()
    * ```
    */
  get chart(): Prisma.ChartDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.chartMember`: Exposes CRUD operations for the **ChartMember** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ChartMembers
    * const chartMembers = await prisma.chartMember.findMany()
    * ```
    */
  get chartMember(): Prisma.ChartMemberDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.jabatan`: Exposes CRUD operations for the **jabatan** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Jabatans
    * const jabatans = await prisma.jabatan.findMany()
    * ```
    */
  get jabatan(): Prisma.jabatanDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.accessRole`: Exposes CRUD operations for the **AccessRole** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AccessRoles
    * const accessRoles = await prisma.accessRole.findMany()
    * ```
    */
  get accessRole(): Prisma.AccessRoleDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.masterAccessRole`: Exposes CRUD operations for the **MasterAccessRole** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MasterAccessRoles
    * const masterAccessRoles = await prisma.masterAccessRole.findMany()
    * ```
    */
  get masterAccessRole(): Prisma.MasterAccessRoleDelegate<ExtArgs, ClientOptions>;
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
   * Prisma Client JS version: 6.19.1
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
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
    Chart: 'Chart',
    ChartMember: 'ChartMember',
    jabatan: 'jabatan',
    AccessRole: 'AccessRole',
    MasterAccessRole: 'MasterAccessRole'
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
      modelProps: "role" | "user" | "chart" | "chartMember" | "jabatan" | "accessRole" | "masterAccessRole"
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
      Chart: {
        payload: Prisma.$ChartPayload<ExtArgs>
        fields: Prisma.ChartFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ChartFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChartPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ChartFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChartPayload>
          }
          findFirst: {
            args: Prisma.ChartFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChartPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ChartFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChartPayload>
          }
          findMany: {
            args: Prisma.ChartFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChartPayload>[]
          }
          create: {
            args: Prisma.ChartCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChartPayload>
          }
          createMany: {
            args: Prisma.ChartCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ChartDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChartPayload>
          }
          update: {
            args: Prisma.ChartUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChartPayload>
          }
          deleteMany: {
            args: Prisma.ChartDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ChartUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ChartUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChartPayload>
          }
          aggregate: {
            args: Prisma.ChartAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateChart>
          }
          groupBy: {
            args: Prisma.ChartGroupByArgs<ExtArgs>
            result: $Utils.Optional<ChartGroupByOutputType>[]
          }
          count: {
            args: Prisma.ChartCountArgs<ExtArgs>
            result: $Utils.Optional<ChartCountAggregateOutputType> | number
          }
        }
      }
      ChartMember: {
        payload: Prisma.$ChartMemberPayload<ExtArgs>
        fields: Prisma.ChartMemberFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ChartMemberFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChartMemberPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ChartMemberFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChartMemberPayload>
          }
          findFirst: {
            args: Prisma.ChartMemberFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChartMemberPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ChartMemberFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChartMemberPayload>
          }
          findMany: {
            args: Prisma.ChartMemberFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChartMemberPayload>[]
          }
          create: {
            args: Prisma.ChartMemberCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChartMemberPayload>
          }
          createMany: {
            args: Prisma.ChartMemberCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ChartMemberDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChartMemberPayload>
          }
          update: {
            args: Prisma.ChartMemberUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChartMemberPayload>
          }
          deleteMany: {
            args: Prisma.ChartMemberDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ChartMemberUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ChartMemberUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChartMemberPayload>
          }
          aggregate: {
            args: Prisma.ChartMemberAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateChartMember>
          }
          groupBy: {
            args: Prisma.ChartMemberGroupByArgs<ExtArgs>
            result: $Utils.Optional<ChartMemberGroupByOutputType>[]
          }
          count: {
            args: Prisma.ChartMemberCountArgs<ExtArgs>
            result: $Utils.Optional<ChartMemberCountAggregateOutputType> | number
          }
        }
      }
      jabatan: {
        payload: Prisma.$jabatanPayload<ExtArgs>
        fields: Prisma.jabatanFieldRefs
        operations: {
          findUnique: {
            args: Prisma.jabatanFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$jabatanPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.jabatanFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$jabatanPayload>
          }
          findFirst: {
            args: Prisma.jabatanFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$jabatanPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.jabatanFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$jabatanPayload>
          }
          findMany: {
            args: Prisma.jabatanFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$jabatanPayload>[]
          }
          create: {
            args: Prisma.jabatanCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$jabatanPayload>
          }
          createMany: {
            args: Prisma.jabatanCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.jabatanDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$jabatanPayload>
          }
          update: {
            args: Prisma.jabatanUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$jabatanPayload>
          }
          deleteMany: {
            args: Prisma.jabatanDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.jabatanUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.jabatanUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$jabatanPayload>
          }
          aggregate: {
            args: Prisma.JabatanAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateJabatan>
          }
          groupBy: {
            args: Prisma.jabatanGroupByArgs<ExtArgs>
            result: $Utils.Optional<JabatanGroupByOutputType>[]
          }
          count: {
            args: Prisma.jabatanCountArgs<ExtArgs>
            result: $Utils.Optional<JabatanCountAggregateOutputType> | number
          }
        }
      }
      AccessRole: {
        payload: Prisma.$AccessRolePayload<ExtArgs>
        fields: Prisma.AccessRoleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AccessRoleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccessRolePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AccessRoleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccessRolePayload>
          }
          findFirst: {
            args: Prisma.AccessRoleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccessRolePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AccessRoleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccessRolePayload>
          }
          findMany: {
            args: Prisma.AccessRoleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccessRolePayload>[]
          }
          create: {
            args: Prisma.AccessRoleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccessRolePayload>
          }
          createMany: {
            args: Prisma.AccessRoleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.AccessRoleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccessRolePayload>
          }
          update: {
            args: Prisma.AccessRoleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccessRolePayload>
          }
          deleteMany: {
            args: Prisma.AccessRoleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AccessRoleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AccessRoleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccessRolePayload>
          }
          aggregate: {
            args: Prisma.AccessRoleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAccessRole>
          }
          groupBy: {
            args: Prisma.AccessRoleGroupByArgs<ExtArgs>
            result: $Utils.Optional<AccessRoleGroupByOutputType>[]
          }
          count: {
            args: Prisma.AccessRoleCountArgs<ExtArgs>
            result: $Utils.Optional<AccessRoleCountAggregateOutputType> | number
          }
        }
      }
      MasterAccessRole: {
        payload: Prisma.$MasterAccessRolePayload<ExtArgs>
        fields: Prisma.MasterAccessRoleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MasterAccessRoleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterAccessRolePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MasterAccessRoleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterAccessRolePayload>
          }
          findFirst: {
            args: Prisma.MasterAccessRoleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterAccessRolePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MasterAccessRoleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterAccessRolePayload>
          }
          findMany: {
            args: Prisma.MasterAccessRoleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterAccessRolePayload>[]
          }
          create: {
            args: Prisma.MasterAccessRoleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterAccessRolePayload>
          }
          createMany: {
            args: Prisma.MasterAccessRoleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.MasterAccessRoleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterAccessRolePayload>
          }
          update: {
            args: Prisma.MasterAccessRoleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterAccessRolePayload>
          }
          deleteMany: {
            args: Prisma.MasterAccessRoleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MasterAccessRoleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MasterAccessRoleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterAccessRolePayload>
          }
          aggregate: {
            args: Prisma.MasterAccessRoleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMasterAccessRole>
          }
          groupBy: {
            args: Prisma.MasterAccessRoleGroupByArgs<ExtArgs>
            result: $Utils.Optional<MasterAccessRoleGroupByOutputType>[]
          }
          count: {
            args: Prisma.MasterAccessRoleCountArgs<ExtArgs>
            result: $Utils.Optional<MasterAccessRoleCountAggregateOutputType> | number
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
    chart?: ChartOmit
    chartMember?: ChartMemberOmit
    jabatan?: jabatanOmit
    accessRole?: AccessRoleOmit
    masterAccessRole?: MasterAccessRoleOmit
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
    createdRoles: number
    deletedRoles: number
    updatedRoles: number
    createdUsers: number
    deletedUsers: number
    updatedUsers: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdRoles?: boolean | UserCountOutputTypeCountCreatedRolesArgs
    deletedRoles?: boolean | UserCountOutputTypeCountDeletedRolesArgs
    updatedRoles?: boolean | UserCountOutputTypeCountUpdatedRolesArgs
    createdUsers?: boolean | UserCountOutputTypeCountCreatedUsersArgs
    deletedUsers?: boolean | UserCountOutputTypeCountDeletedUsersArgs
    updatedUsers?: boolean | UserCountOutputTypeCountUpdatedUsersArgs
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
  export type UserCountOutputTypeCountCreatedRolesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
  export type UserCountOutputTypeCountUpdatedRolesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RoleWhereInput
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
  export type UserCountOutputTypeCountDeletedUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountUpdatedUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }


  /**
   * Count Type ChartCountOutputType
   */

  export type ChartCountOutputType = {
    children: number
    members: number
  }

  export type ChartCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    children?: boolean | ChartCountOutputTypeCountChildrenArgs
    members?: boolean | ChartCountOutputTypeCountMembersArgs
  }

  // Custom InputTypes
  /**
   * ChartCountOutputType without action
   */
  export type ChartCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChartCountOutputType
     */
    select?: ChartCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ChartCountOutputType without action
   */
  export type ChartCountOutputTypeCountChildrenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ChartWhereInput
  }

  /**
   * ChartCountOutputType without action
   */
  export type ChartCountOutputTypeCountMembersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ChartMemberWhereInput
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
    deleter?: boolean | Role$deleterArgs<ExtArgs>
    updater?: boolean | Role$updaterArgs<ExtArgs>
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
    deleter?: boolean | Role$deleterArgs<ExtArgs>
    updater?: boolean | Role$updaterArgs<ExtArgs>
    users?: boolean | Role$usersArgs<ExtArgs>
    _count?: boolean | RoleCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $RolePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Role"
    objects: {
      creator: Prisma.$UserPayload<ExtArgs> | null
      deleter: Prisma.$UserPayload<ExtArgs> | null
      updater: Prisma.$UserPayload<ExtArgs> | null
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
    deleter<T extends Role$deleterArgs<ExtArgs> = {}>(args?: Subset<T, Role$deleterArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    updater<T extends Role$updaterArgs<ExtArgs> = {}>(args?: Subset<T, Role$updaterArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
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
    createdRoles?: boolean | User$createdRolesArgs<ExtArgs>
    deletedRoles?: boolean | User$deletedRolesArgs<ExtArgs>
    updatedRoles?: boolean | User$updatedRolesArgs<ExtArgs>
    creator?: boolean | User$creatorArgs<ExtArgs>
    createdUsers?: boolean | User$createdUsersArgs<ExtArgs>
    deleter?: boolean | User$deleterArgs<ExtArgs>
    deletedUsers?: boolean | User$deletedUsersArgs<ExtArgs>
    role?: boolean | RoleDefaultArgs<ExtArgs>
    updater?: boolean | User$updaterArgs<ExtArgs>
    updatedUsers?: boolean | User$updatedUsersArgs<ExtArgs>
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
    createdRoles?: boolean | User$createdRolesArgs<ExtArgs>
    deletedRoles?: boolean | User$deletedRolesArgs<ExtArgs>
    updatedRoles?: boolean | User$updatedRolesArgs<ExtArgs>
    creator?: boolean | User$creatorArgs<ExtArgs>
    createdUsers?: boolean | User$createdUsersArgs<ExtArgs>
    deleter?: boolean | User$deleterArgs<ExtArgs>
    deletedUsers?: boolean | User$deletedUsersArgs<ExtArgs>
    role?: boolean | RoleDefaultArgs<ExtArgs>
    updater?: boolean | User$updaterArgs<ExtArgs>
    updatedUsers?: boolean | User$updatedUsersArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      createdRoles: Prisma.$RolePayload<ExtArgs>[]
      deletedRoles: Prisma.$RolePayload<ExtArgs>[]
      updatedRoles: Prisma.$RolePayload<ExtArgs>[]
      creator: Prisma.$UserPayload<ExtArgs> | null
      createdUsers: Prisma.$UserPayload<ExtArgs>[]
      deleter: Prisma.$UserPayload<ExtArgs> | null
      deletedUsers: Prisma.$UserPayload<ExtArgs>[]
      role: Prisma.$RolePayload<ExtArgs>
      updater: Prisma.$UserPayload<ExtArgs> | null
      updatedUsers: Prisma.$UserPayload<ExtArgs>[]
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
    createdRoles<T extends User$createdRolesArgs<ExtArgs> = {}>(args?: Subset<T, User$createdRolesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    deletedRoles<T extends User$deletedRolesArgs<ExtArgs> = {}>(args?: Subset<T, User$deletedRolesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    updatedRoles<T extends User$updatedRolesArgs<ExtArgs> = {}>(args?: Subset<T, User$updatedRolesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    creator<T extends User$creatorArgs<ExtArgs> = {}>(args?: Subset<T, User$creatorArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    createdUsers<T extends User$createdUsersArgs<ExtArgs> = {}>(args?: Subset<T, User$createdUsersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    deleter<T extends User$deleterArgs<ExtArgs> = {}>(args?: Subset<T, User$deleterArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    deletedUsers<T extends User$deletedUsersArgs<ExtArgs> = {}>(args?: Subset<T, User$deletedUsersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    role<T extends RoleDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RoleDefaultArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    updater<T extends User$updaterArgs<ExtArgs> = {}>(args?: Subset<T, User$updaterArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    updatedUsers<T extends User$updatedUsersArgs<ExtArgs> = {}>(args?: Subset<T, User$updatedUsersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Model Chart
   */

  export type AggregateChart = {
    _count: ChartCountAggregateOutputType | null
    _avg: ChartAvgAggregateOutputType | null
    _sum: ChartSumAggregateOutputType | null
    _min: ChartMinAggregateOutputType | null
    _max: ChartMaxAggregateOutputType | null
  }

  export type ChartAvgAggregateOutputType = {
    pilarId: number | null
    sbuId: number | null
    sbuSubId: number | null
    capacity: number | null
    orderIndex: number | null
  }

  export type ChartSumAggregateOutputType = {
    pilarId: number | null
    sbuId: number | null
    sbuSubId: number | null
    capacity: number | null
    orderIndex: number | null
  }

  export type ChartMinAggregateOutputType = {
    chartId: string | null
    pilarId: number | null
    sbuId: number | null
    sbuSubId: number | null
    parentId: string | null
    position: string | null
    capacity: number | null
    orderIndex: number | null
    createdAt: Date | null
    createdBy: string | null
    updatedAt: Date | null
    updatedBy: string | null
    isDeleted: boolean | null
    deletedAt: Date | null
    deletedBy: string | null
    jobDesc: string | null
  }

  export type ChartMaxAggregateOutputType = {
    chartId: string | null
    pilarId: number | null
    sbuId: number | null
    sbuSubId: number | null
    parentId: string | null
    position: string | null
    capacity: number | null
    orderIndex: number | null
    createdAt: Date | null
    createdBy: string | null
    updatedAt: Date | null
    updatedBy: string | null
    isDeleted: boolean | null
    deletedAt: Date | null
    deletedBy: string | null
    jobDesc: string | null
  }

  export type ChartCountAggregateOutputType = {
    chartId: number
    pilarId: number
    sbuId: number
    sbuSubId: number
    parentId: number
    position: number
    capacity: number
    orderIndex: number
    createdAt: number
    createdBy: number
    updatedAt: number
    updatedBy: number
    isDeleted: number
    deletedAt: number
    deletedBy: number
    jobDesc: number
    _all: number
  }


  export type ChartAvgAggregateInputType = {
    pilarId?: true
    sbuId?: true
    sbuSubId?: true
    capacity?: true
    orderIndex?: true
  }

  export type ChartSumAggregateInputType = {
    pilarId?: true
    sbuId?: true
    sbuSubId?: true
    capacity?: true
    orderIndex?: true
  }

  export type ChartMinAggregateInputType = {
    chartId?: true
    pilarId?: true
    sbuId?: true
    sbuSubId?: true
    parentId?: true
    position?: true
    capacity?: true
    orderIndex?: true
    createdAt?: true
    createdBy?: true
    updatedAt?: true
    updatedBy?: true
    isDeleted?: true
    deletedAt?: true
    deletedBy?: true
    jobDesc?: true
  }

  export type ChartMaxAggregateInputType = {
    chartId?: true
    pilarId?: true
    sbuId?: true
    sbuSubId?: true
    parentId?: true
    position?: true
    capacity?: true
    orderIndex?: true
    createdAt?: true
    createdBy?: true
    updatedAt?: true
    updatedBy?: true
    isDeleted?: true
    deletedAt?: true
    deletedBy?: true
    jobDesc?: true
  }

  export type ChartCountAggregateInputType = {
    chartId?: true
    pilarId?: true
    sbuId?: true
    sbuSubId?: true
    parentId?: true
    position?: true
    capacity?: true
    orderIndex?: true
    createdAt?: true
    createdBy?: true
    updatedAt?: true
    updatedBy?: true
    isDeleted?: true
    deletedAt?: true
    deletedBy?: true
    jobDesc?: true
    _all?: true
  }

  export type ChartAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Chart to aggregate.
     */
    where?: ChartWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Charts to fetch.
     */
    orderBy?: ChartOrderByWithRelationInput | ChartOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ChartWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Charts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Charts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Charts
    **/
    _count?: true | ChartCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ChartAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ChartSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ChartMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ChartMaxAggregateInputType
  }

  export type GetChartAggregateType<T extends ChartAggregateArgs> = {
        [P in keyof T & keyof AggregateChart]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateChart[P]>
      : GetScalarType<T[P], AggregateChart[P]>
  }




  export type ChartGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ChartWhereInput
    orderBy?: ChartOrderByWithAggregationInput | ChartOrderByWithAggregationInput[]
    by: ChartScalarFieldEnum[] | ChartScalarFieldEnum
    having?: ChartScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ChartCountAggregateInputType | true
    _avg?: ChartAvgAggregateInputType
    _sum?: ChartSumAggregateInputType
    _min?: ChartMinAggregateInputType
    _max?: ChartMaxAggregateInputType
  }

  export type ChartGroupByOutputType = {
    chartId: string
    pilarId: number
    sbuId: number
    sbuSubId: number
    parentId: string | null
    position: string
    capacity: number
    orderIndex: number
    createdAt: Date
    createdBy: string | null
    updatedAt: Date
    updatedBy: string | null
    isDeleted: boolean
    deletedAt: Date | null
    deletedBy: string | null
    jobDesc: string | null
    _count: ChartCountAggregateOutputType | null
    _avg: ChartAvgAggregateOutputType | null
    _sum: ChartSumAggregateOutputType | null
    _min: ChartMinAggregateOutputType | null
    _max: ChartMaxAggregateOutputType | null
  }

  type GetChartGroupByPayload<T extends ChartGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ChartGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ChartGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ChartGroupByOutputType[P]>
            : GetScalarType<T[P], ChartGroupByOutputType[P]>
        }
      >
    >


  export type ChartSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    chartId?: boolean
    pilarId?: boolean
    sbuId?: boolean
    sbuSubId?: boolean
    parentId?: boolean
    position?: boolean
    capacity?: boolean
    orderIndex?: boolean
    createdAt?: boolean
    createdBy?: boolean
    updatedAt?: boolean
    updatedBy?: boolean
    isDeleted?: boolean
    deletedAt?: boolean
    deletedBy?: boolean
    jobDesc?: boolean
    parent?: boolean | Chart$parentArgs<ExtArgs>
    children?: boolean | Chart$childrenArgs<ExtArgs>
    members?: boolean | Chart$membersArgs<ExtArgs>
    _count?: boolean | ChartCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["chart"]>



  export type ChartSelectScalar = {
    chartId?: boolean
    pilarId?: boolean
    sbuId?: boolean
    sbuSubId?: boolean
    parentId?: boolean
    position?: boolean
    capacity?: boolean
    orderIndex?: boolean
    createdAt?: boolean
    createdBy?: boolean
    updatedAt?: boolean
    updatedBy?: boolean
    isDeleted?: boolean
    deletedAt?: boolean
    deletedBy?: boolean
    jobDesc?: boolean
  }

  export type ChartOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"chartId" | "pilarId" | "sbuId" | "sbuSubId" | "parentId" | "position" | "capacity" | "orderIndex" | "createdAt" | "createdBy" | "updatedAt" | "updatedBy" | "isDeleted" | "deletedAt" | "deletedBy" | "jobDesc", ExtArgs["result"]["chart"]>
  export type ChartInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    parent?: boolean | Chart$parentArgs<ExtArgs>
    children?: boolean | Chart$childrenArgs<ExtArgs>
    members?: boolean | Chart$membersArgs<ExtArgs>
    _count?: boolean | ChartCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $ChartPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Chart"
    objects: {
      parent: Prisma.$ChartPayload<ExtArgs> | null
      children: Prisma.$ChartPayload<ExtArgs>[]
      members: Prisma.$ChartMemberPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      /**
       * e.g., "NODE251120-0001"
       */
      chartId: string
      pilarId: number
      sbuId: number
      sbuSubId: number
      /**
       * NULL = posisi teratas (presiden)
       */
      parentId: string | null
      position: string
      capacity: number
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
      jobDesc: string | null
    }, ExtArgs["result"]["chart"]>
    composites: {}
  }

  type ChartGetPayload<S extends boolean | null | undefined | ChartDefaultArgs> = $Result.GetResult<Prisma.$ChartPayload, S>

  type ChartCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ChartFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ChartCountAggregateInputType | true
    }

  export interface ChartDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Chart'], meta: { name: 'Chart' } }
    /**
     * Find zero or one Chart that matches the filter.
     * @param {ChartFindUniqueArgs} args - Arguments to find a Chart
     * @example
     * // Get one Chart
     * const chart = await prisma.chart.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ChartFindUniqueArgs>(args: SelectSubset<T, ChartFindUniqueArgs<ExtArgs>>): Prisma__ChartClient<$Result.GetResult<Prisma.$ChartPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Chart that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ChartFindUniqueOrThrowArgs} args - Arguments to find a Chart
     * @example
     * // Get one Chart
     * const chart = await prisma.chart.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ChartFindUniqueOrThrowArgs>(args: SelectSubset<T, ChartFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ChartClient<$Result.GetResult<Prisma.$ChartPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Chart that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChartFindFirstArgs} args - Arguments to find a Chart
     * @example
     * // Get one Chart
     * const chart = await prisma.chart.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ChartFindFirstArgs>(args?: SelectSubset<T, ChartFindFirstArgs<ExtArgs>>): Prisma__ChartClient<$Result.GetResult<Prisma.$ChartPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Chart that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChartFindFirstOrThrowArgs} args - Arguments to find a Chart
     * @example
     * // Get one Chart
     * const chart = await prisma.chart.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ChartFindFirstOrThrowArgs>(args?: SelectSubset<T, ChartFindFirstOrThrowArgs<ExtArgs>>): Prisma__ChartClient<$Result.GetResult<Prisma.$ChartPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Charts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChartFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Charts
     * const charts = await prisma.chart.findMany()
     * 
     * // Get first 10 Charts
     * const charts = await prisma.chart.findMany({ take: 10 })
     * 
     * // Only select the `chartId`
     * const chartWithChartIdOnly = await prisma.chart.findMany({ select: { chartId: true } })
     * 
     */
    findMany<T extends ChartFindManyArgs>(args?: SelectSubset<T, ChartFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChartPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Chart.
     * @param {ChartCreateArgs} args - Arguments to create a Chart.
     * @example
     * // Create one Chart
     * const Chart = await prisma.chart.create({
     *   data: {
     *     // ... data to create a Chart
     *   }
     * })
     * 
     */
    create<T extends ChartCreateArgs>(args: SelectSubset<T, ChartCreateArgs<ExtArgs>>): Prisma__ChartClient<$Result.GetResult<Prisma.$ChartPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Charts.
     * @param {ChartCreateManyArgs} args - Arguments to create many Charts.
     * @example
     * // Create many Charts
     * const chart = await prisma.chart.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ChartCreateManyArgs>(args?: SelectSubset<T, ChartCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Chart.
     * @param {ChartDeleteArgs} args - Arguments to delete one Chart.
     * @example
     * // Delete one Chart
     * const Chart = await prisma.chart.delete({
     *   where: {
     *     // ... filter to delete one Chart
     *   }
     * })
     * 
     */
    delete<T extends ChartDeleteArgs>(args: SelectSubset<T, ChartDeleteArgs<ExtArgs>>): Prisma__ChartClient<$Result.GetResult<Prisma.$ChartPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Chart.
     * @param {ChartUpdateArgs} args - Arguments to update one Chart.
     * @example
     * // Update one Chart
     * const chart = await prisma.chart.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ChartUpdateArgs>(args: SelectSubset<T, ChartUpdateArgs<ExtArgs>>): Prisma__ChartClient<$Result.GetResult<Prisma.$ChartPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Charts.
     * @param {ChartDeleteManyArgs} args - Arguments to filter Charts to delete.
     * @example
     * // Delete a few Charts
     * const { count } = await prisma.chart.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ChartDeleteManyArgs>(args?: SelectSubset<T, ChartDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Charts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChartUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Charts
     * const chart = await prisma.chart.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ChartUpdateManyArgs>(args: SelectSubset<T, ChartUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Chart.
     * @param {ChartUpsertArgs} args - Arguments to update or create a Chart.
     * @example
     * // Update or create a Chart
     * const chart = await prisma.chart.upsert({
     *   create: {
     *     // ... data to create a Chart
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Chart we want to update
     *   }
     * })
     */
    upsert<T extends ChartUpsertArgs>(args: SelectSubset<T, ChartUpsertArgs<ExtArgs>>): Prisma__ChartClient<$Result.GetResult<Prisma.$ChartPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Charts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChartCountArgs} args - Arguments to filter Charts to count.
     * @example
     * // Count the number of Charts
     * const count = await prisma.chart.count({
     *   where: {
     *     // ... the filter for the Charts we want to count
     *   }
     * })
    **/
    count<T extends ChartCountArgs>(
      args?: Subset<T, ChartCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ChartCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Chart.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChartAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ChartAggregateArgs>(args: Subset<T, ChartAggregateArgs>): Prisma.PrismaPromise<GetChartAggregateType<T>>

    /**
     * Group by Chart.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChartGroupByArgs} args - Group by arguments.
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
      T extends ChartGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ChartGroupByArgs['orderBy'] }
        : { orderBy?: ChartGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ChartGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetChartGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Chart model
   */
  readonly fields: ChartFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Chart.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ChartClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    parent<T extends Chart$parentArgs<ExtArgs> = {}>(args?: Subset<T, Chart$parentArgs<ExtArgs>>): Prisma__ChartClient<$Result.GetResult<Prisma.$ChartPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    children<T extends Chart$childrenArgs<ExtArgs> = {}>(args?: Subset<T, Chart$childrenArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChartPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    members<T extends Chart$membersArgs<ExtArgs> = {}>(args?: Subset<T, Chart$membersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChartMemberPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the Chart model
   */
  interface ChartFieldRefs {
    readonly chartId: FieldRef<"Chart", 'String'>
    readonly pilarId: FieldRef<"Chart", 'Int'>
    readonly sbuId: FieldRef<"Chart", 'Int'>
    readonly sbuSubId: FieldRef<"Chart", 'Int'>
    readonly parentId: FieldRef<"Chart", 'String'>
    readonly position: FieldRef<"Chart", 'String'>
    readonly capacity: FieldRef<"Chart", 'Int'>
    readonly orderIndex: FieldRef<"Chart", 'Int'>
    readonly createdAt: FieldRef<"Chart", 'DateTime'>
    readonly createdBy: FieldRef<"Chart", 'String'>
    readonly updatedAt: FieldRef<"Chart", 'DateTime'>
    readonly updatedBy: FieldRef<"Chart", 'String'>
    readonly isDeleted: FieldRef<"Chart", 'Boolean'>
    readonly deletedAt: FieldRef<"Chart", 'DateTime'>
    readonly deletedBy: FieldRef<"Chart", 'String'>
    readonly jobDesc: FieldRef<"Chart", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Chart findUnique
   */
  export type ChartFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Chart
     */
    select?: ChartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Chart
     */
    omit?: ChartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChartInclude<ExtArgs> | null
    /**
     * Filter, which Chart to fetch.
     */
    where: ChartWhereUniqueInput
  }

  /**
   * Chart findUniqueOrThrow
   */
  export type ChartFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Chart
     */
    select?: ChartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Chart
     */
    omit?: ChartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChartInclude<ExtArgs> | null
    /**
     * Filter, which Chart to fetch.
     */
    where: ChartWhereUniqueInput
  }

  /**
   * Chart findFirst
   */
  export type ChartFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Chart
     */
    select?: ChartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Chart
     */
    omit?: ChartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChartInclude<ExtArgs> | null
    /**
     * Filter, which Chart to fetch.
     */
    where?: ChartWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Charts to fetch.
     */
    orderBy?: ChartOrderByWithRelationInput | ChartOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Charts.
     */
    cursor?: ChartWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Charts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Charts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Charts.
     */
    distinct?: ChartScalarFieldEnum | ChartScalarFieldEnum[]
  }

  /**
   * Chart findFirstOrThrow
   */
  export type ChartFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Chart
     */
    select?: ChartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Chart
     */
    omit?: ChartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChartInclude<ExtArgs> | null
    /**
     * Filter, which Chart to fetch.
     */
    where?: ChartWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Charts to fetch.
     */
    orderBy?: ChartOrderByWithRelationInput | ChartOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Charts.
     */
    cursor?: ChartWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Charts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Charts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Charts.
     */
    distinct?: ChartScalarFieldEnum | ChartScalarFieldEnum[]
  }

  /**
   * Chart findMany
   */
  export type ChartFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Chart
     */
    select?: ChartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Chart
     */
    omit?: ChartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChartInclude<ExtArgs> | null
    /**
     * Filter, which Charts to fetch.
     */
    where?: ChartWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Charts to fetch.
     */
    orderBy?: ChartOrderByWithRelationInput | ChartOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Charts.
     */
    cursor?: ChartWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Charts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Charts.
     */
    skip?: number
    distinct?: ChartScalarFieldEnum | ChartScalarFieldEnum[]
  }

  /**
   * Chart create
   */
  export type ChartCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Chart
     */
    select?: ChartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Chart
     */
    omit?: ChartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChartInclude<ExtArgs> | null
    /**
     * The data needed to create a Chart.
     */
    data: XOR<ChartCreateInput, ChartUncheckedCreateInput>
  }

  /**
   * Chart createMany
   */
  export type ChartCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Charts.
     */
    data: ChartCreateManyInput | ChartCreateManyInput[]
  }

  /**
   * Chart update
   */
  export type ChartUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Chart
     */
    select?: ChartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Chart
     */
    omit?: ChartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChartInclude<ExtArgs> | null
    /**
     * The data needed to update a Chart.
     */
    data: XOR<ChartUpdateInput, ChartUncheckedUpdateInput>
    /**
     * Choose, which Chart to update.
     */
    where: ChartWhereUniqueInput
  }

  /**
   * Chart updateMany
   */
  export type ChartUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Charts.
     */
    data: XOR<ChartUpdateManyMutationInput, ChartUncheckedUpdateManyInput>
    /**
     * Filter which Charts to update
     */
    where?: ChartWhereInput
    /**
     * Limit how many Charts to update.
     */
    limit?: number
  }

  /**
   * Chart upsert
   */
  export type ChartUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Chart
     */
    select?: ChartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Chart
     */
    omit?: ChartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChartInclude<ExtArgs> | null
    /**
     * The filter to search for the Chart to update in case it exists.
     */
    where: ChartWhereUniqueInput
    /**
     * In case the Chart found by the `where` argument doesn't exist, create a new Chart with this data.
     */
    create: XOR<ChartCreateInput, ChartUncheckedCreateInput>
    /**
     * In case the Chart was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ChartUpdateInput, ChartUncheckedUpdateInput>
  }

  /**
   * Chart delete
   */
  export type ChartDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Chart
     */
    select?: ChartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Chart
     */
    omit?: ChartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChartInclude<ExtArgs> | null
    /**
     * Filter which Chart to delete.
     */
    where: ChartWhereUniqueInput
  }

  /**
   * Chart deleteMany
   */
  export type ChartDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Charts to delete
     */
    where?: ChartWhereInput
    /**
     * Limit how many Charts to delete.
     */
    limit?: number
  }

  /**
   * Chart.parent
   */
  export type Chart$parentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Chart
     */
    select?: ChartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Chart
     */
    omit?: ChartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChartInclude<ExtArgs> | null
    where?: ChartWhereInput
  }

  /**
   * Chart.children
   */
  export type Chart$childrenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Chart
     */
    select?: ChartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Chart
     */
    omit?: ChartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChartInclude<ExtArgs> | null
    where?: ChartWhereInput
    orderBy?: ChartOrderByWithRelationInput | ChartOrderByWithRelationInput[]
    cursor?: ChartWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ChartScalarFieldEnum | ChartScalarFieldEnum[]
  }

  /**
   * Chart.members
   */
  export type Chart$membersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChartMember
     */
    select?: ChartMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChartMember
     */
    omit?: ChartMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChartMemberInclude<ExtArgs> | null
    where?: ChartMemberWhereInput
    orderBy?: ChartMemberOrderByWithRelationInput | ChartMemberOrderByWithRelationInput[]
    cursor?: ChartMemberWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ChartMemberScalarFieldEnum | ChartMemberScalarFieldEnum[]
  }

  /**
   * Chart without action
   */
  export type ChartDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Chart
     */
    select?: ChartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Chart
     */
    omit?: ChartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChartInclude<ExtArgs> | null
  }


  /**
   * Model ChartMember
   */

  export type AggregateChartMember = {
    _count: ChartMemberCountAggregateOutputType | null
    _avg: ChartMemberAvgAggregateOutputType | null
    _sum: ChartMemberSumAggregateOutputType | null
    _min: ChartMemberMinAggregateOutputType | null
    _max: ChartMemberMaxAggregateOutputType | null
  }

  export type ChartMemberAvgAggregateOutputType = {
    userId: number | null
  }

  export type ChartMemberSumAggregateOutputType = {
    userId: number | null
  }

  export type ChartMemberMinAggregateOutputType = {
    memberChartId: string | null
    chartId: string | null
    userId: number | null
    createdAt: Date | null
    createdBy: string | null
    updatedAt: Date | null
    updatedBy: string | null
    isDeleted: boolean | null
    deletedAt: Date | null
    deletedBy: string | null
    jabatan: string | null
  }

  export type ChartMemberMaxAggregateOutputType = {
    memberChartId: string | null
    chartId: string | null
    userId: number | null
    createdAt: Date | null
    createdBy: string | null
    updatedAt: Date | null
    updatedBy: string | null
    isDeleted: boolean | null
    deletedAt: Date | null
    deletedBy: string | null
    jabatan: string | null
  }

  export type ChartMemberCountAggregateOutputType = {
    memberChartId: number
    chartId: number
    userId: number
    createdAt: number
    createdBy: number
    updatedAt: number
    updatedBy: number
    isDeleted: number
    deletedAt: number
    deletedBy: number
    jabatan: number
    _all: number
  }


  export type ChartMemberAvgAggregateInputType = {
    userId?: true
  }

  export type ChartMemberSumAggregateInputType = {
    userId?: true
  }

  export type ChartMemberMinAggregateInputType = {
    memberChartId?: true
    chartId?: true
    userId?: true
    createdAt?: true
    createdBy?: true
    updatedAt?: true
    updatedBy?: true
    isDeleted?: true
    deletedAt?: true
    deletedBy?: true
    jabatan?: true
  }

  export type ChartMemberMaxAggregateInputType = {
    memberChartId?: true
    chartId?: true
    userId?: true
    createdAt?: true
    createdBy?: true
    updatedAt?: true
    updatedBy?: true
    isDeleted?: true
    deletedAt?: true
    deletedBy?: true
    jabatan?: true
  }

  export type ChartMemberCountAggregateInputType = {
    memberChartId?: true
    chartId?: true
    userId?: true
    createdAt?: true
    createdBy?: true
    updatedAt?: true
    updatedBy?: true
    isDeleted?: true
    deletedAt?: true
    deletedBy?: true
    jabatan?: true
    _all?: true
  }

  export type ChartMemberAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ChartMember to aggregate.
     */
    where?: ChartMemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChartMembers to fetch.
     */
    orderBy?: ChartMemberOrderByWithRelationInput | ChartMemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ChartMemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChartMembers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChartMembers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ChartMembers
    **/
    _count?: true | ChartMemberCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ChartMemberAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ChartMemberSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ChartMemberMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ChartMemberMaxAggregateInputType
  }

  export type GetChartMemberAggregateType<T extends ChartMemberAggregateArgs> = {
        [P in keyof T & keyof AggregateChartMember]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateChartMember[P]>
      : GetScalarType<T[P], AggregateChartMember[P]>
  }




  export type ChartMemberGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ChartMemberWhereInput
    orderBy?: ChartMemberOrderByWithAggregationInput | ChartMemberOrderByWithAggregationInput[]
    by: ChartMemberScalarFieldEnum[] | ChartMemberScalarFieldEnum
    having?: ChartMemberScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ChartMemberCountAggregateInputType | true
    _avg?: ChartMemberAvgAggregateInputType
    _sum?: ChartMemberSumAggregateInputType
    _min?: ChartMemberMinAggregateInputType
    _max?: ChartMemberMaxAggregateInputType
  }

  export type ChartMemberGroupByOutputType = {
    memberChartId: string
    chartId: string
    userId: number | null
    createdAt: Date
    createdBy: string | null
    updatedAt: Date
    updatedBy: string | null
    isDeleted: boolean
    deletedAt: Date | null
    deletedBy: string | null
    jabatan: string | null
    _count: ChartMemberCountAggregateOutputType | null
    _avg: ChartMemberAvgAggregateOutputType | null
    _sum: ChartMemberSumAggregateOutputType | null
    _min: ChartMemberMinAggregateOutputType | null
    _max: ChartMemberMaxAggregateOutputType | null
  }

  type GetChartMemberGroupByPayload<T extends ChartMemberGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ChartMemberGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ChartMemberGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ChartMemberGroupByOutputType[P]>
            : GetScalarType<T[P], ChartMemberGroupByOutputType[P]>
        }
      >
    >


  export type ChartMemberSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    memberChartId?: boolean
    chartId?: boolean
    userId?: boolean
    createdAt?: boolean
    createdBy?: boolean
    updatedAt?: boolean
    updatedBy?: boolean
    isDeleted?: boolean
    deletedAt?: boolean
    deletedBy?: boolean
    jabatan?: boolean
    node?: boolean | ChartDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["chartMember"]>



  export type ChartMemberSelectScalar = {
    memberChartId?: boolean
    chartId?: boolean
    userId?: boolean
    createdAt?: boolean
    createdBy?: boolean
    updatedAt?: boolean
    updatedBy?: boolean
    isDeleted?: boolean
    deletedAt?: boolean
    deletedBy?: boolean
    jabatan?: boolean
  }

  export type ChartMemberOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"memberChartId" | "chartId" | "userId" | "createdAt" | "createdBy" | "updatedAt" | "updatedBy" | "isDeleted" | "deletedAt" | "deletedBy" | "jabatan", ExtArgs["result"]["chartMember"]>
  export type ChartMemberInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    node?: boolean | ChartDefaultArgs<ExtArgs>
  }

  export type $ChartMemberPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ChartMember"
    objects: {
      node: Prisma.$ChartPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      memberChartId: string
      chartId: string
      userId: number | null
      createdAt: Date
      createdBy: string | null
      updatedAt: Date
      updatedBy: string | null
      isDeleted: boolean
      deletedAt: Date | null
      deletedBy: string | null
      jabatan: string | null
    }, ExtArgs["result"]["chartMember"]>
    composites: {}
  }

  type ChartMemberGetPayload<S extends boolean | null | undefined | ChartMemberDefaultArgs> = $Result.GetResult<Prisma.$ChartMemberPayload, S>

  type ChartMemberCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ChartMemberFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ChartMemberCountAggregateInputType | true
    }

  export interface ChartMemberDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ChartMember'], meta: { name: 'ChartMember' } }
    /**
     * Find zero or one ChartMember that matches the filter.
     * @param {ChartMemberFindUniqueArgs} args - Arguments to find a ChartMember
     * @example
     * // Get one ChartMember
     * const chartMember = await prisma.chartMember.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ChartMemberFindUniqueArgs>(args: SelectSubset<T, ChartMemberFindUniqueArgs<ExtArgs>>): Prisma__ChartMemberClient<$Result.GetResult<Prisma.$ChartMemberPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ChartMember that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ChartMemberFindUniqueOrThrowArgs} args - Arguments to find a ChartMember
     * @example
     * // Get one ChartMember
     * const chartMember = await prisma.chartMember.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ChartMemberFindUniqueOrThrowArgs>(args: SelectSubset<T, ChartMemberFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ChartMemberClient<$Result.GetResult<Prisma.$ChartMemberPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ChartMember that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChartMemberFindFirstArgs} args - Arguments to find a ChartMember
     * @example
     * // Get one ChartMember
     * const chartMember = await prisma.chartMember.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ChartMemberFindFirstArgs>(args?: SelectSubset<T, ChartMemberFindFirstArgs<ExtArgs>>): Prisma__ChartMemberClient<$Result.GetResult<Prisma.$ChartMemberPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ChartMember that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChartMemberFindFirstOrThrowArgs} args - Arguments to find a ChartMember
     * @example
     * // Get one ChartMember
     * const chartMember = await prisma.chartMember.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ChartMemberFindFirstOrThrowArgs>(args?: SelectSubset<T, ChartMemberFindFirstOrThrowArgs<ExtArgs>>): Prisma__ChartMemberClient<$Result.GetResult<Prisma.$ChartMemberPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ChartMembers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChartMemberFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ChartMembers
     * const chartMembers = await prisma.chartMember.findMany()
     * 
     * // Get first 10 ChartMembers
     * const chartMembers = await prisma.chartMember.findMany({ take: 10 })
     * 
     * // Only select the `memberChartId`
     * const chartMemberWithMemberChartIdOnly = await prisma.chartMember.findMany({ select: { memberChartId: true } })
     * 
     */
    findMany<T extends ChartMemberFindManyArgs>(args?: SelectSubset<T, ChartMemberFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChartMemberPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ChartMember.
     * @param {ChartMemberCreateArgs} args - Arguments to create a ChartMember.
     * @example
     * // Create one ChartMember
     * const ChartMember = await prisma.chartMember.create({
     *   data: {
     *     // ... data to create a ChartMember
     *   }
     * })
     * 
     */
    create<T extends ChartMemberCreateArgs>(args: SelectSubset<T, ChartMemberCreateArgs<ExtArgs>>): Prisma__ChartMemberClient<$Result.GetResult<Prisma.$ChartMemberPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ChartMembers.
     * @param {ChartMemberCreateManyArgs} args - Arguments to create many ChartMembers.
     * @example
     * // Create many ChartMembers
     * const chartMember = await prisma.chartMember.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ChartMemberCreateManyArgs>(args?: SelectSubset<T, ChartMemberCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a ChartMember.
     * @param {ChartMemberDeleteArgs} args - Arguments to delete one ChartMember.
     * @example
     * // Delete one ChartMember
     * const ChartMember = await prisma.chartMember.delete({
     *   where: {
     *     // ... filter to delete one ChartMember
     *   }
     * })
     * 
     */
    delete<T extends ChartMemberDeleteArgs>(args: SelectSubset<T, ChartMemberDeleteArgs<ExtArgs>>): Prisma__ChartMemberClient<$Result.GetResult<Prisma.$ChartMemberPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ChartMember.
     * @param {ChartMemberUpdateArgs} args - Arguments to update one ChartMember.
     * @example
     * // Update one ChartMember
     * const chartMember = await prisma.chartMember.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ChartMemberUpdateArgs>(args: SelectSubset<T, ChartMemberUpdateArgs<ExtArgs>>): Prisma__ChartMemberClient<$Result.GetResult<Prisma.$ChartMemberPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ChartMembers.
     * @param {ChartMemberDeleteManyArgs} args - Arguments to filter ChartMembers to delete.
     * @example
     * // Delete a few ChartMembers
     * const { count } = await prisma.chartMember.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ChartMemberDeleteManyArgs>(args?: SelectSubset<T, ChartMemberDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ChartMembers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChartMemberUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ChartMembers
     * const chartMember = await prisma.chartMember.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ChartMemberUpdateManyArgs>(args: SelectSubset<T, ChartMemberUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ChartMember.
     * @param {ChartMemberUpsertArgs} args - Arguments to update or create a ChartMember.
     * @example
     * // Update or create a ChartMember
     * const chartMember = await prisma.chartMember.upsert({
     *   create: {
     *     // ... data to create a ChartMember
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ChartMember we want to update
     *   }
     * })
     */
    upsert<T extends ChartMemberUpsertArgs>(args: SelectSubset<T, ChartMemberUpsertArgs<ExtArgs>>): Prisma__ChartMemberClient<$Result.GetResult<Prisma.$ChartMemberPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ChartMembers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChartMemberCountArgs} args - Arguments to filter ChartMembers to count.
     * @example
     * // Count the number of ChartMembers
     * const count = await prisma.chartMember.count({
     *   where: {
     *     // ... the filter for the ChartMembers we want to count
     *   }
     * })
    **/
    count<T extends ChartMemberCountArgs>(
      args?: Subset<T, ChartMemberCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ChartMemberCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ChartMember.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChartMemberAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ChartMemberAggregateArgs>(args: Subset<T, ChartMemberAggregateArgs>): Prisma.PrismaPromise<GetChartMemberAggregateType<T>>

    /**
     * Group by ChartMember.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChartMemberGroupByArgs} args - Group by arguments.
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
      T extends ChartMemberGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ChartMemberGroupByArgs['orderBy'] }
        : { orderBy?: ChartMemberGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ChartMemberGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetChartMemberGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ChartMember model
   */
  readonly fields: ChartMemberFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ChartMember.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ChartMemberClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    node<T extends ChartDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ChartDefaultArgs<ExtArgs>>): Prisma__ChartClient<$Result.GetResult<Prisma.$ChartPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the ChartMember model
   */
  interface ChartMemberFieldRefs {
    readonly memberChartId: FieldRef<"ChartMember", 'String'>
    readonly chartId: FieldRef<"ChartMember", 'String'>
    readonly userId: FieldRef<"ChartMember", 'Int'>
    readonly createdAt: FieldRef<"ChartMember", 'DateTime'>
    readonly createdBy: FieldRef<"ChartMember", 'String'>
    readonly updatedAt: FieldRef<"ChartMember", 'DateTime'>
    readonly updatedBy: FieldRef<"ChartMember", 'String'>
    readonly isDeleted: FieldRef<"ChartMember", 'Boolean'>
    readonly deletedAt: FieldRef<"ChartMember", 'DateTime'>
    readonly deletedBy: FieldRef<"ChartMember", 'String'>
    readonly jabatan: FieldRef<"ChartMember", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ChartMember findUnique
   */
  export type ChartMemberFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChartMember
     */
    select?: ChartMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChartMember
     */
    omit?: ChartMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChartMemberInclude<ExtArgs> | null
    /**
     * Filter, which ChartMember to fetch.
     */
    where: ChartMemberWhereUniqueInput
  }

  /**
   * ChartMember findUniqueOrThrow
   */
  export type ChartMemberFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChartMember
     */
    select?: ChartMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChartMember
     */
    omit?: ChartMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChartMemberInclude<ExtArgs> | null
    /**
     * Filter, which ChartMember to fetch.
     */
    where: ChartMemberWhereUniqueInput
  }

  /**
   * ChartMember findFirst
   */
  export type ChartMemberFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChartMember
     */
    select?: ChartMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChartMember
     */
    omit?: ChartMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChartMemberInclude<ExtArgs> | null
    /**
     * Filter, which ChartMember to fetch.
     */
    where?: ChartMemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChartMembers to fetch.
     */
    orderBy?: ChartMemberOrderByWithRelationInput | ChartMemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ChartMembers.
     */
    cursor?: ChartMemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChartMembers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChartMembers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ChartMembers.
     */
    distinct?: ChartMemberScalarFieldEnum | ChartMemberScalarFieldEnum[]
  }

  /**
   * ChartMember findFirstOrThrow
   */
  export type ChartMemberFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChartMember
     */
    select?: ChartMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChartMember
     */
    omit?: ChartMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChartMemberInclude<ExtArgs> | null
    /**
     * Filter, which ChartMember to fetch.
     */
    where?: ChartMemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChartMembers to fetch.
     */
    orderBy?: ChartMemberOrderByWithRelationInput | ChartMemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ChartMembers.
     */
    cursor?: ChartMemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChartMembers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChartMembers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ChartMembers.
     */
    distinct?: ChartMemberScalarFieldEnum | ChartMemberScalarFieldEnum[]
  }

  /**
   * ChartMember findMany
   */
  export type ChartMemberFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChartMember
     */
    select?: ChartMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChartMember
     */
    omit?: ChartMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChartMemberInclude<ExtArgs> | null
    /**
     * Filter, which ChartMembers to fetch.
     */
    where?: ChartMemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChartMembers to fetch.
     */
    orderBy?: ChartMemberOrderByWithRelationInput | ChartMemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ChartMembers.
     */
    cursor?: ChartMemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChartMembers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChartMembers.
     */
    skip?: number
    distinct?: ChartMemberScalarFieldEnum | ChartMemberScalarFieldEnum[]
  }

  /**
   * ChartMember create
   */
  export type ChartMemberCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChartMember
     */
    select?: ChartMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChartMember
     */
    omit?: ChartMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChartMemberInclude<ExtArgs> | null
    /**
     * The data needed to create a ChartMember.
     */
    data: XOR<ChartMemberCreateInput, ChartMemberUncheckedCreateInput>
  }

  /**
   * ChartMember createMany
   */
  export type ChartMemberCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ChartMembers.
     */
    data: ChartMemberCreateManyInput | ChartMemberCreateManyInput[]
  }

  /**
   * ChartMember update
   */
  export type ChartMemberUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChartMember
     */
    select?: ChartMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChartMember
     */
    omit?: ChartMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChartMemberInclude<ExtArgs> | null
    /**
     * The data needed to update a ChartMember.
     */
    data: XOR<ChartMemberUpdateInput, ChartMemberUncheckedUpdateInput>
    /**
     * Choose, which ChartMember to update.
     */
    where: ChartMemberWhereUniqueInput
  }

  /**
   * ChartMember updateMany
   */
  export type ChartMemberUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ChartMembers.
     */
    data: XOR<ChartMemberUpdateManyMutationInput, ChartMemberUncheckedUpdateManyInput>
    /**
     * Filter which ChartMembers to update
     */
    where?: ChartMemberWhereInput
    /**
     * Limit how many ChartMembers to update.
     */
    limit?: number
  }

  /**
   * ChartMember upsert
   */
  export type ChartMemberUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChartMember
     */
    select?: ChartMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChartMember
     */
    omit?: ChartMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChartMemberInclude<ExtArgs> | null
    /**
     * The filter to search for the ChartMember to update in case it exists.
     */
    where: ChartMemberWhereUniqueInput
    /**
     * In case the ChartMember found by the `where` argument doesn't exist, create a new ChartMember with this data.
     */
    create: XOR<ChartMemberCreateInput, ChartMemberUncheckedCreateInput>
    /**
     * In case the ChartMember was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ChartMemberUpdateInput, ChartMemberUncheckedUpdateInput>
  }

  /**
   * ChartMember delete
   */
  export type ChartMemberDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChartMember
     */
    select?: ChartMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChartMember
     */
    omit?: ChartMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChartMemberInclude<ExtArgs> | null
    /**
     * Filter which ChartMember to delete.
     */
    where: ChartMemberWhereUniqueInput
  }

  /**
   * ChartMember deleteMany
   */
  export type ChartMemberDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ChartMembers to delete
     */
    where?: ChartMemberWhereInput
    /**
     * Limit how many ChartMembers to delete.
     */
    limit?: number
  }

  /**
   * ChartMember without action
   */
  export type ChartMemberDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChartMember
     */
    select?: ChartMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChartMember
     */
    omit?: ChartMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChartMemberInclude<ExtArgs> | null
  }


  /**
   * Model jabatan
   */

  export type AggregateJabatan = {
    _count: JabatanCountAggregateOutputType | null
    _avg: JabatanAvgAggregateOutputType | null
    _sum: JabatanSumAggregateOutputType | null
    _min: JabatanMinAggregateOutputType | null
    _max: JabatanMaxAggregateOutputType | null
  }

  export type JabatanAvgAggregateOutputType = {
    jabatanLevel: number | null
  }

  export type JabatanSumAggregateOutputType = {
    jabatanLevel: number | null
  }

  export type JabatanMinAggregateOutputType = {
    jabatanId: string | null
    jabatanName: string | null
    jabatanLevel: number | null
    jabatanDesc: string | null
    jabatanIsActive: boolean | null
    createdAt: Date | null
    createdBy: string | null
    updatedAt: Date | null
    updatedBy: string | null
    isDeleted: boolean | null
    deletedAt: Date | null
    deletedBy: string | null
  }

  export type JabatanMaxAggregateOutputType = {
    jabatanId: string | null
    jabatanName: string | null
    jabatanLevel: number | null
    jabatanDesc: string | null
    jabatanIsActive: boolean | null
    createdAt: Date | null
    createdBy: string | null
    updatedAt: Date | null
    updatedBy: string | null
    isDeleted: boolean | null
    deletedAt: Date | null
    deletedBy: string | null
  }

  export type JabatanCountAggregateOutputType = {
    jabatanId: number
    jabatanName: number
    jabatanLevel: number
    jabatanDesc: number
    jabatanIsActive: number
    createdAt: number
    createdBy: number
    updatedAt: number
    updatedBy: number
    isDeleted: number
    deletedAt: number
    deletedBy: number
    _all: number
  }


  export type JabatanAvgAggregateInputType = {
    jabatanLevel?: true
  }

  export type JabatanSumAggregateInputType = {
    jabatanLevel?: true
  }

  export type JabatanMinAggregateInputType = {
    jabatanId?: true
    jabatanName?: true
    jabatanLevel?: true
    jabatanDesc?: true
    jabatanIsActive?: true
    createdAt?: true
    createdBy?: true
    updatedAt?: true
    updatedBy?: true
    isDeleted?: true
    deletedAt?: true
    deletedBy?: true
  }

  export type JabatanMaxAggregateInputType = {
    jabatanId?: true
    jabatanName?: true
    jabatanLevel?: true
    jabatanDesc?: true
    jabatanIsActive?: true
    createdAt?: true
    createdBy?: true
    updatedAt?: true
    updatedBy?: true
    isDeleted?: true
    deletedAt?: true
    deletedBy?: true
  }

  export type JabatanCountAggregateInputType = {
    jabatanId?: true
    jabatanName?: true
    jabatanLevel?: true
    jabatanDesc?: true
    jabatanIsActive?: true
    createdAt?: true
    createdBy?: true
    updatedAt?: true
    updatedBy?: true
    isDeleted?: true
    deletedAt?: true
    deletedBy?: true
    _all?: true
  }

  export type JabatanAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which jabatan to aggregate.
     */
    where?: jabatanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of jabatans to fetch.
     */
    orderBy?: jabatanOrderByWithRelationInput | jabatanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: jabatanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` jabatans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` jabatans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned jabatans
    **/
    _count?: true | JabatanCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: JabatanAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: JabatanSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: JabatanMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: JabatanMaxAggregateInputType
  }

  export type GetJabatanAggregateType<T extends JabatanAggregateArgs> = {
        [P in keyof T & keyof AggregateJabatan]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateJabatan[P]>
      : GetScalarType<T[P], AggregateJabatan[P]>
  }




  export type jabatanGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: jabatanWhereInput
    orderBy?: jabatanOrderByWithAggregationInput | jabatanOrderByWithAggregationInput[]
    by: JabatanScalarFieldEnum[] | JabatanScalarFieldEnum
    having?: jabatanScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: JabatanCountAggregateInputType | true
    _avg?: JabatanAvgAggregateInputType
    _sum?: JabatanSumAggregateInputType
    _min?: JabatanMinAggregateInputType
    _max?: JabatanMaxAggregateInputType
  }

  export type JabatanGroupByOutputType = {
    jabatanId: string
    jabatanName: string
    jabatanLevel: number
    jabatanDesc: string | null
    jabatanIsActive: boolean
    createdAt: Date
    createdBy: string | null
    updatedAt: Date
    updatedBy: string | null
    isDeleted: boolean
    deletedAt: Date | null
    deletedBy: string | null
    _count: JabatanCountAggregateOutputType | null
    _avg: JabatanAvgAggregateOutputType | null
    _sum: JabatanSumAggregateOutputType | null
    _min: JabatanMinAggregateOutputType | null
    _max: JabatanMaxAggregateOutputType | null
  }

  type GetJabatanGroupByPayload<T extends jabatanGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<JabatanGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof JabatanGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], JabatanGroupByOutputType[P]>
            : GetScalarType<T[P], JabatanGroupByOutputType[P]>
        }
      >
    >


  export type jabatanSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    jabatanId?: boolean
    jabatanName?: boolean
    jabatanLevel?: boolean
    jabatanDesc?: boolean
    jabatanIsActive?: boolean
    createdAt?: boolean
    createdBy?: boolean
    updatedAt?: boolean
    updatedBy?: boolean
    isDeleted?: boolean
    deletedAt?: boolean
    deletedBy?: boolean
  }, ExtArgs["result"]["jabatan"]>



  export type jabatanSelectScalar = {
    jabatanId?: boolean
    jabatanName?: boolean
    jabatanLevel?: boolean
    jabatanDesc?: boolean
    jabatanIsActive?: boolean
    createdAt?: boolean
    createdBy?: boolean
    updatedAt?: boolean
    updatedBy?: boolean
    isDeleted?: boolean
    deletedAt?: boolean
    deletedBy?: boolean
  }

  export type jabatanOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"jabatanId" | "jabatanName" | "jabatanLevel" | "jabatanDesc" | "jabatanIsActive" | "createdAt" | "createdBy" | "updatedAt" | "updatedBy" | "isDeleted" | "deletedAt" | "deletedBy", ExtArgs["result"]["jabatan"]>

  export type $jabatanPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "jabatan"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      jabatanId: string
      jabatanName: string
      jabatanLevel: number
      jabatanDesc: string | null
      jabatanIsActive: boolean
      createdAt: Date
      createdBy: string | null
      updatedAt: Date
      updatedBy: string | null
      isDeleted: boolean
      deletedAt: Date | null
      deletedBy: string | null
    }, ExtArgs["result"]["jabatan"]>
    composites: {}
  }

  type jabatanGetPayload<S extends boolean | null | undefined | jabatanDefaultArgs> = $Result.GetResult<Prisma.$jabatanPayload, S>

  type jabatanCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<jabatanFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: JabatanCountAggregateInputType | true
    }

  export interface jabatanDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['jabatan'], meta: { name: 'jabatan' } }
    /**
     * Find zero or one Jabatan that matches the filter.
     * @param {jabatanFindUniqueArgs} args - Arguments to find a Jabatan
     * @example
     * // Get one Jabatan
     * const jabatan = await prisma.jabatan.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends jabatanFindUniqueArgs>(args: SelectSubset<T, jabatanFindUniqueArgs<ExtArgs>>): Prisma__jabatanClient<$Result.GetResult<Prisma.$jabatanPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Jabatan that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {jabatanFindUniqueOrThrowArgs} args - Arguments to find a Jabatan
     * @example
     * // Get one Jabatan
     * const jabatan = await prisma.jabatan.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends jabatanFindUniqueOrThrowArgs>(args: SelectSubset<T, jabatanFindUniqueOrThrowArgs<ExtArgs>>): Prisma__jabatanClient<$Result.GetResult<Prisma.$jabatanPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Jabatan that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {jabatanFindFirstArgs} args - Arguments to find a Jabatan
     * @example
     * // Get one Jabatan
     * const jabatan = await prisma.jabatan.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends jabatanFindFirstArgs>(args?: SelectSubset<T, jabatanFindFirstArgs<ExtArgs>>): Prisma__jabatanClient<$Result.GetResult<Prisma.$jabatanPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Jabatan that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {jabatanFindFirstOrThrowArgs} args - Arguments to find a Jabatan
     * @example
     * // Get one Jabatan
     * const jabatan = await prisma.jabatan.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends jabatanFindFirstOrThrowArgs>(args?: SelectSubset<T, jabatanFindFirstOrThrowArgs<ExtArgs>>): Prisma__jabatanClient<$Result.GetResult<Prisma.$jabatanPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Jabatans that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {jabatanFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Jabatans
     * const jabatans = await prisma.jabatan.findMany()
     * 
     * // Get first 10 Jabatans
     * const jabatans = await prisma.jabatan.findMany({ take: 10 })
     * 
     * // Only select the `jabatanId`
     * const jabatanWithJabatanIdOnly = await prisma.jabatan.findMany({ select: { jabatanId: true } })
     * 
     */
    findMany<T extends jabatanFindManyArgs>(args?: SelectSubset<T, jabatanFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$jabatanPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Jabatan.
     * @param {jabatanCreateArgs} args - Arguments to create a Jabatan.
     * @example
     * // Create one Jabatan
     * const Jabatan = await prisma.jabatan.create({
     *   data: {
     *     // ... data to create a Jabatan
     *   }
     * })
     * 
     */
    create<T extends jabatanCreateArgs>(args: SelectSubset<T, jabatanCreateArgs<ExtArgs>>): Prisma__jabatanClient<$Result.GetResult<Prisma.$jabatanPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Jabatans.
     * @param {jabatanCreateManyArgs} args - Arguments to create many Jabatans.
     * @example
     * // Create many Jabatans
     * const jabatan = await prisma.jabatan.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends jabatanCreateManyArgs>(args?: SelectSubset<T, jabatanCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Jabatan.
     * @param {jabatanDeleteArgs} args - Arguments to delete one Jabatan.
     * @example
     * // Delete one Jabatan
     * const Jabatan = await prisma.jabatan.delete({
     *   where: {
     *     // ... filter to delete one Jabatan
     *   }
     * })
     * 
     */
    delete<T extends jabatanDeleteArgs>(args: SelectSubset<T, jabatanDeleteArgs<ExtArgs>>): Prisma__jabatanClient<$Result.GetResult<Prisma.$jabatanPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Jabatan.
     * @param {jabatanUpdateArgs} args - Arguments to update one Jabatan.
     * @example
     * // Update one Jabatan
     * const jabatan = await prisma.jabatan.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends jabatanUpdateArgs>(args: SelectSubset<T, jabatanUpdateArgs<ExtArgs>>): Prisma__jabatanClient<$Result.GetResult<Prisma.$jabatanPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Jabatans.
     * @param {jabatanDeleteManyArgs} args - Arguments to filter Jabatans to delete.
     * @example
     * // Delete a few Jabatans
     * const { count } = await prisma.jabatan.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends jabatanDeleteManyArgs>(args?: SelectSubset<T, jabatanDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Jabatans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {jabatanUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Jabatans
     * const jabatan = await prisma.jabatan.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends jabatanUpdateManyArgs>(args: SelectSubset<T, jabatanUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Jabatan.
     * @param {jabatanUpsertArgs} args - Arguments to update or create a Jabatan.
     * @example
     * // Update or create a Jabatan
     * const jabatan = await prisma.jabatan.upsert({
     *   create: {
     *     // ... data to create a Jabatan
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Jabatan we want to update
     *   }
     * })
     */
    upsert<T extends jabatanUpsertArgs>(args: SelectSubset<T, jabatanUpsertArgs<ExtArgs>>): Prisma__jabatanClient<$Result.GetResult<Prisma.$jabatanPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Jabatans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {jabatanCountArgs} args - Arguments to filter Jabatans to count.
     * @example
     * // Count the number of Jabatans
     * const count = await prisma.jabatan.count({
     *   where: {
     *     // ... the filter for the Jabatans we want to count
     *   }
     * })
    **/
    count<T extends jabatanCountArgs>(
      args?: Subset<T, jabatanCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], JabatanCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Jabatan.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JabatanAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends JabatanAggregateArgs>(args: Subset<T, JabatanAggregateArgs>): Prisma.PrismaPromise<GetJabatanAggregateType<T>>

    /**
     * Group by Jabatan.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {jabatanGroupByArgs} args - Group by arguments.
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
      T extends jabatanGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: jabatanGroupByArgs['orderBy'] }
        : { orderBy?: jabatanGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, jabatanGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetJabatanGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the jabatan model
   */
  readonly fields: jabatanFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for jabatan.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__jabatanClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the jabatan model
   */
  interface jabatanFieldRefs {
    readonly jabatanId: FieldRef<"jabatan", 'String'>
    readonly jabatanName: FieldRef<"jabatan", 'String'>
    readonly jabatanLevel: FieldRef<"jabatan", 'Int'>
    readonly jabatanDesc: FieldRef<"jabatan", 'String'>
    readonly jabatanIsActive: FieldRef<"jabatan", 'Boolean'>
    readonly createdAt: FieldRef<"jabatan", 'DateTime'>
    readonly createdBy: FieldRef<"jabatan", 'String'>
    readonly updatedAt: FieldRef<"jabatan", 'DateTime'>
    readonly updatedBy: FieldRef<"jabatan", 'String'>
    readonly isDeleted: FieldRef<"jabatan", 'Boolean'>
    readonly deletedAt: FieldRef<"jabatan", 'DateTime'>
    readonly deletedBy: FieldRef<"jabatan", 'String'>
  }
    

  // Custom InputTypes
  /**
   * jabatan findUnique
   */
  export type jabatanFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the jabatan
     */
    select?: jabatanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the jabatan
     */
    omit?: jabatanOmit<ExtArgs> | null
    /**
     * Filter, which jabatan to fetch.
     */
    where: jabatanWhereUniqueInput
  }

  /**
   * jabatan findUniqueOrThrow
   */
  export type jabatanFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the jabatan
     */
    select?: jabatanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the jabatan
     */
    omit?: jabatanOmit<ExtArgs> | null
    /**
     * Filter, which jabatan to fetch.
     */
    where: jabatanWhereUniqueInput
  }

  /**
   * jabatan findFirst
   */
  export type jabatanFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the jabatan
     */
    select?: jabatanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the jabatan
     */
    omit?: jabatanOmit<ExtArgs> | null
    /**
     * Filter, which jabatan to fetch.
     */
    where?: jabatanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of jabatans to fetch.
     */
    orderBy?: jabatanOrderByWithRelationInput | jabatanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for jabatans.
     */
    cursor?: jabatanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` jabatans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` jabatans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of jabatans.
     */
    distinct?: JabatanScalarFieldEnum | JabatanScalarFieldEnum[]
  }

  /**
   * jabatan findFirstOrThrow
   */
  export type jabatanFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the jabatan
     */
    select?: jabatanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the jabatan
     */
    omit?: jabatanOmit<ExtArgs> | null
    /**
     * Filter, which jabatan to fetch.
     */
    where?: jabatanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of jabatans to fetch.
     */
    orderBy?: jabatanOrderByWithRelationInput | jabatanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for jabatans.
     */
    cursor?: jabatanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` jabatans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` jabatans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of jabatans.
     */
    distinct?: JabatanScalarFieldEnum | JabatanScalarFieldEnum[]
  }

  /**
   * jabatan findMany
   */
  export type jabatanFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the jabatan
     */
    select?: jabatanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the jabatan
     */
    omit?: jabatanOmit<ExtArgs> | null
    /**
     * Filter, which jabatans to fetch.
     */
    where?: jabatanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of jabatans to fetch.
     */
    orderBy?: jabatanOrderByWithRelationInput | jabatanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing jabatans.
     */
    cursor?: jabatanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` jabatans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` jabatans.
     */
    skip?: number
    distinct?: JabatanScalarFieldEnum | JabatanScalarFieldEnum[]
  }

  /**
   * jabatan create
   */
  export type jabatanCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the jabatan
     */
    select?: jabatanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the jabatan
     */
    omit?: jabatanOmit<ExtArgs> | null
    /**
     * The data needed to create a jabatan.
     */
    data: XOR<jabatanCreateInput, jabatanUncheckedCreateInput>
  }

  /**
   * jabatan createMany
   */
  export type jabatanCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many jabatans.
     */
    data: jabatanCreateManyInput | jabatanCreateManyInput[]
  }

  /**
   * jabatan update
   */
  export type jabatanUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the jabatan
     */
    select?: jabatanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the jabatan
     */
    omit?: jabatanOmit<ExtArgs> | null
    /**
     * The data needed to update a jabatan.
     */
    data: XOR<jabatanUpdateInput, jabatanUncheckedUpdateInput>
    /**
     * Choose, which jabatan to update.
     */
    where: jabatanWhereUniqueInput
  }

  /**
   * jabatan updateMany
   */
  export type jabatanUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update jabatans.
     */
    data: XOR<jabatanUpdateManyMutationInput, jabatanUncheckedUpdateManyInput>
    /**
     * Filter which jabatans to update
     */
    where?: jabatanWhereInput
    /**
     * Limit how many jabatans to update.
     */
    limit?: number
  }

  /**
   * jabatan upsert
   */
  export type jabatanUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the jabatan
     */
    select?: jabatanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the jabatan
     */
    omit?: jabatanOmit<ExtArgs> | null
    /**
     * The filter to search for the jabatan to update in case it exists.
     */
    where: jabatanWhereUniqueInput
    /**
     * In case the jabatan found by the `where` argument doesn't exist, create a new jabatan with this data.
     */
    create: XOR<jabatanCreateInput, jabatanUncheckedCreateInput>
    /**
     * In case the jabatan was found with the provided `where` argument, update it with this data.
     */
    update: XOR<jabatanUpdateInput, jabatanUncheckedUpdateInput>
  }

  /**
   * jabatan delete
   */
  export type jabatanDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the jabatan
     */
    select?: jabatanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the jabatan
     */
    omit?: jabatanOmit<ExtArgs> | null
    /**
     * Filter which jabatan to delete.
     */
    where: jabatanWhereUniqueInput
  }

  /**
   * jabatan deleteMany
   */
  export type jabatanDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which jabatans to delete
     */
    where?: jabatanWhereInput
    /**
     * Limit how many jabatans to delete.
     */
    limit?: number
  }

  /**
   * jabatan without action
   */
  export type jabatanDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the jabatan
     */
    select?: jabatanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the jabatan
     */
    omit?: jabatanOmit<ExtArgs> | null
  }


  /**
   * Model AccessRole
   */

  export type AggregateAccessRole = {
    _count: AccessRoleCountAggregateOutputType | null
    _min: AccessRoleMinAggregateOutputType | null
    _max: AccessRoleMaxAggregateOutputType | null
  }

  export type AccessRoleMinAggregateOutputType = {
    accessId: string | null
    subjectType: string | null
    subjectId: string | null
    resourceType: string | null
    masAccessId: string | null
    resourceKey: string | null
    accessLevel: string | null
    isActive: boolean | null
    isDeleted: boolean | null
    createdAt: Date | null
    createdBy: string | null
    updatedAt: Date | null
    updatedBy: string | null
    deletedAt: Date | null
    deletedBy: string | null
  }

  export type AccessRoleMaxAggregateOutputType = {
    accessId: string | null
    subjectType: string | null
    subjectId: string | null
    resourceType: string | null
    masAccessId: string | null
    resourceKey: string | null
    accessLevel: string | null
    isActive: boolean | null
    isDeleted: boolean | null
    createdAt: Date | null
    createdBy: string | null
    updatedAt: Date | null
    updatedBy: string | null
    deletedAt: Date | null
    deletedBy: string | null
  }

  export type AccessRoleCountAggregateOutputType = {
    accessId: number
    subjectType: number
    subjectId: number
    resourceType: number
    masAccessId: number
    resourceKey: number
    accessLevel: number
    isActive: number
    isDeleted: number
    createdAt: number
    createdBy: number
    updatedAt: number
    updatedBy: number
    deletedAt: number
    deletedBy: number
    _all: number
  }


  export type AccessRoleMinAggregateInputType = {
    accessId?: true
    subjectType?: true
    subjectId?: true
    resourceType?: true
    masAccessId?: true
    resourceKey?: true
    accessLevel?: true
    isActive?: true
    isDeleted?: true
    createdAt?: true
    createdBy?: true
    updatedAt?: true
    updatedBy?: true
    deletedAt?: true
    deletedBy?: true
  }

  export type AccessRoleMaxAggregateInputType = {
    accessId?: true
    subjectType?: true
    subjectId?: true
    resourceType?: true
    masAccessId?: true
    resourceKey?: true
    accessLevel?: true
    isActive?: true
    isDeleted?: true
    createdAt?: true
    createdBy?: true
    updatedAt?: true
    updatedBy?: true
    deletedAt?: true
    deletedBy?: true
  }

  export type AccessRoleCountAggregateInputType = {
    accessId?: true
    subjectType?: true
    subjectId?: true
    resourceType?: true
    masAccessId?: true
    resourceKey?: true
    accessLevel?: true
    isActive?: true
    isDeleted?: true
    createdAt?: true
    createdBy?: true
    updatedAt?: true
    updatedBy?: true
    deletedAt?: true
    deletedBy?: true
    _all?: true
  }

  export type AccessRoleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AccessRole to aggregate.
     */
    where?: AccessRoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AccessRoles to fetch.
     */
    orderBy?: AccessRoleOrderByWithRelationInput | AccessRoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AccessRoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AccessRoles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AccessRoles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AccessRoles
    **/
    _count?: true | AccessRoleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AccessRoleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AccessRoleMaxAggregateInputType
  }

  export type GetAccessRoleAggregateType<T extends AccessRoleAggregateArgs> = {
        [P in keyof T & keyof AggregateAccessRole]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAccessRole[P]>
      : GetScalarType<T[P], AggregateAccessRole[P]>
  }




  export type AccessRoleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AccessRoleWhereInput
    orderBy?: AccessRoleOrderByWithAggregationInput | AccessRoleOrderByWithAggregationInput[]
    by: AccessRoleScalarFieldEnum[] | AccessRoleScalarFieldEnum
    having?: AccessRoleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AccessRoleCountAggregateInputType | true
    _min?: AccessRoleMinAggregateInputType
    _max?: AccessRoleMaxAggregateInputType
  }

  export type AccessRoleGroupByOutputType = {
    accessId: string
    subjectType: string
    subjectId: string
    resourceType: string
    masAccessId: string | null
    resourceKey: string | null
    accessLevel: string
    isActive: boolean
    isDeleted: boolean
    createdAt: Date
    createdBy: string | null
    updatedAt: Date
    updatedBy: string | null
    deletedAt: Date | null
    deletedBy: string | null
    _count: AccessRoleCountAggregateOutputType | null
    _min: AccessRoleMinAggregateOutputType | null
    _max: AccessRoleMaxAggregateOutputType | null
  }

  type GetAccessRoleGroupByPayload<T extends AccessRoleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AccessRoleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AccessRoleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AccessRoleGroupByOutputType[P]>
            : GetScalarType<T[P], AccessRoleGroupByOutputType[P]>
        }
      >
    >


  export type AccessRoleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    accessId?: boolean
    subjectType?: boolean
    subjectId?: boolean
    resourceType?: boolean
    masAccessId?: boolean
    resourceKey?: boolean
    accessLevel?: boolean
    isActive?: boolean
    isDeleted?: boolean
    createdAt?: boolean
    createdBy?: boolean
    updatedAt?: boolean
    updatedBy?: boolean
    deletedAt?: boolean
    deletedBy?: boolean
  }, ExtArgs["result"]["accessRole"]>



  export type AccessRoleSelectScalar = {
    accessId?: boolean
    subjectType?: boolean
    subjectId?: boolean
    resourceType?: boolean
    masAccessId?: boolean
    resourceKey?: boolean
    accessLevel?: boolean
    isActive?: boolean
    isDeleted?: boolean
    createdAt?: boolean
    createdBy?: boolean
    updatedAt?: boolean
    updatedBy?: boolean
    deletedAt?: boolean
    deletedBy?: boolean
  }

  export type AccessRoleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"accessId" | "subjectType" | "subjectId" | "resourceType" | "masAccessId" | "resourceKey" | "accessLevel" | "isActive" | "isDeleted" | "createdAt" | "createdBy" | "updatedAt" | "updatedBy" | "deletedAt" | "deletedBy", ExtArgs["result"]["accessRole"]>

  export type $AccessRolePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AccessRole"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      accessId: string
      subjectType: string
      subjectId: string
      resourceType: string
      masAccessId: string | null
      resourceKey: string | null
      accessLevel: string
      isActive: boolean
      isDeleted: boolean
      createdAt: Date
      createdBy: string | null
      updatedAt: Date
      updatedBy: string | null
      deletedAt: Date | null
      deletedBy: string | null
    }, ExtArgs["result"]["accessRole"]>
    composites: {}
  }

  type AccessRoleGetPayload<S extends boolean | null | undefined | AccessRoleDefaultArgs> = $Result.GetResult<Prisma.$AccessRolePayload, S>

  type AccessRoleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AccessRoleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AccessRoleCountAggregateInputType | true
    }

  export interface AccessRoleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AccessRole'], meta: { name: 'AccessRole' } }
    /**
     * Find zero or one AccessRole that matches the filter.
     * @param {AccessRoleFindUniqueArgs} args - Arguments to find a AccessRole
     * @example
     * // Get one AccessRole
     * const accessRole = await prisma.accessRole.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AccessRoleFindUniqueArgs>(args: SelectSubset<T, AccessRoleFindUniqueArgs<ExtArgs>>): Prisma__AccessRoleClient<$Result.GetResult<Prisma.$AccessRolePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AccessRole that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AccessRoleFindUniqueOrThrowArgs} args - Arguments to find a AccessRole
     * @example
     * // Get one AccessRole
     * const accessRole = await prisma.accessRole.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AccessRoleFindUniqueOrThrowArgs>(args: SelectSubset<T, AccessRoleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AccessRoleClient<$Result.GetResult<Prisma.$AccessRolePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AccessRole that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccessRoleFindFirstArgs} args - Arguments to find a AccessRole
     * @example
     * // Get one AccessRole
     * const accessRole = await prisma.accessRole.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AccessRoleFindFirstArgs>(args?: SelectSubset<T, AccessRoleFindFirstArgs<ExtArgs>>): Prisma__AccessRoleClient<$Result.GetResult<Prisma.$AccessRolePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AccessRole that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccessRoleFindFirstOrThrowArgs} args - Arguments to find a AccessRole
     * @example
     * // Get one AccessRole
     * const accessRole = await prisma.accessRole.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AccessRoleFindFirstOrThrowArgs>(args?: SelectSubset<T, AccessRoleFindFirstOrThrowArgs<ExtArgs>>): Prisma__AccessRoleClient<$Result.GetResult<Prisma.$AccessRolePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AccessRoles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccessRoleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AccessRoles
     * const accessRoles = await prisma.accessRole.findMany()
     * 
     * // Get first 10 AccessRoles
     * const accessRoles = await prisma.accessRole.findMany({ take: 10 })
     * 
     * // Only select the `accessId`
     * const accessRoleWithAccessIdOnly = await prisma.accessRole.findMany({ select: { accessId: true } })
     * 
     */
    findMany<T extends AccessRoleFindManyArgs>(args?: SelectSubset<T, AccessRoleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccessRolePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AccessRole.
     * @param {AccessRoleCreateArgs} args - Arguments to create a AccessRole.
     * @example
     * // Create one AccessRole
     * const AccessRole = await prisma.accessRole.create({
     *   data: {
     *     // ... data to create a AccessRole
     *   }
     * })
     * 
     */
    create<T extends AccessRoleCreateArgs>(args: SelectSubset<T, AccessRoleCreateArgs<ExtArgs>>): Prisma__AccessRoleClient<$Result.GetResult<Prisma.$AccessRolePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AccessRoles.
     * @param {AccessRoleCreateManyArgs} args - Arguments to create many AccessRoles.
     * @example
     * // Create many AccessRoles
     * const accessRole = await prisma.accessRole.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AccessRoleCreateManyArgs>(args?: SelectSubset<T, AccessRoleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a AccessRole.
     * @param {AccessRoleDeleteArgs} args - Arguments to delete one AccessRole.
     * @example
     * // Delete one AccessRole
     * const AccessRole = await prisma.accessRole.delete({
     *   where: {
     *     // ... filter to delete one AccessRole
     *   }
     * })
     * 
     */
    delete<T extends AccessRoleDeleteArgs>(args: SelectSubset<T, AccessRoleDeleteArgs<ExtArgs>>): Prisma__AccessRoleClient<$Result.GetResult<Prisma.$AccessRolePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AccessRole.
     * @param {AccessRoleUpdateArgs} args - Arguments to update one AccessRole.
     * @example
     * // Update one AccessRole
     * const accessRole = await prisma.accessRole.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AccessRoleUpdateArgs>(args: SelectSubset<T, AccessRoleUpdateArgs<ExtArgs>>): Prisma__AccessRoleClient<$Result.GetResult<Prisma.$AccessRolePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AccessRoles.
     * @param {AccessRoleDeleteManyArgs} args - Arguments to filter AccessRoles to delete.
     * @example
     * // Delete a few AccessRoles
     * const { count } = await prisma.accessRole.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AccessRoleDeleteManyArgs>(args?: SelectSubset<T, AccessRoleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AccessRoles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccessRoleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AccessRoles
     * const accessRole = await prisma.accessRole.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AccessRoleUpdateManyArgs>(args: SelectSubset<T, AccessRoleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AccessRole.
     * @param {AccessRoleUpsertArgs} args - Arguments to update or create a AccessRole.
     * @example
     * // Update or create a AccessRole
     * const accessRole = await prisma.accessRole.upsert({
     *   create: {
     *     // ... data to create a AccessRole
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AccessRole we want to update
     *   }
     * })
     */
    upsert<T extends AccessRoleUpsertArgs>(args: SelectSubset<T, AccessRoleUpsertArgs<ExtArgs>>): Prisma__AccessRoleClient<$Result.GetResult<Prisma.$AccessRolePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AccessRoles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccessRoleCountArgs} args - Arguments to filter AccessRoles to count.
     * @example
     * // Count the number of AccessRoles
     * const count = await prisma.accessRole.count({
     *   where: {
     *     // ... the filter for the AccessRoles we want to count
     *   }
     * })
    **/
    count<T extends AccessRoleCountArgs>(
      args?: Subset<T, AccessRoleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AccessRoleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AccessRole.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccessRoleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AccessRoleAggregateArgs>(args: Subset<T, AccessRoleAggregateArgs>): Prisma.PrismaPromise<GetAccessRoleAggregateType<T>>

    /**
     * Group by AccessRole.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccessRoleGroupByArgs} args - Group by arguments.
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
      T extends AccessRoleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AccessRoleGroupByArgs['orderBy'] }
        : { orderBy?: AccessRoleGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, AccessRoleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAccessRoleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AccessRole model
   */
  readonly fields: AccessRoleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AccessRole.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AccessRoleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the AccessRole model
   */
  interface AccessRoleFieldRefs {
    readonly accessId: FieldRef<"AccessRole", 'String'>
    readonly subjectType: FieldRef<"AccessRole", 'String'>
    readonly subjectId: FieldRef<"AccessRole", 'String'>
    readonly resourceType: FieldRef<"AccessRole", 'String'>
    readonly masAccessId: FieldRef<"AccessRole", 'String'>
    readonly resourceKey: FieldRef<"AccessRole", 'String'>
    readonly accessLevel: FieldRef<"AccessRole", 'String'>
    readonly isActive: FieldRef<"AccessRole", 'Boolean'>
    readonly isDeleted: FieldRef<"AccessRole", 'Boolean'>
    readonly createdAt: FieldRef<"AccessRole", 'DateTime'>
    readonly createdBy: FieldRef<"AccessRole", 'String'>
    readonly updatedAt: FieldRef<"AccessRole", 'DateTime'>
    readonly updatedBy: FieldRef<"AccessRole", 'String'>
    readonly deletedAt: FieldRef<"AccessRole", 'DateTime'>
    readonly deletedBy: FieldRef<"AccessRole", 'String'>
  }
    

  // Custom InputTypes
  /**
   * AccessRole findUnique
   */
  export type AccessRoleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccessRole
     */
    select?: AccessRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccessRole
     */
    omit?: AccessRoleOmit<ExtArgs> | null
    /**
     * Filter, which AccessRole to fetch.
     */
    where: AccessRoleWhereUniqueInput
  }

  /**
   * AccessRole findUniqueOrThrow
   */
  export type AccessRoleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccessRole
     */
    select?: AccessRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccessRole
     */
    omit?: AccessRoleOmit<ExtArgs> | null
    /**
     * Filter, which AccessRole to fetch.
     */
    where: AccessRoleWhereUniqueInput
  }

  /**
   * AccessRole findFirst
   */
  export type AccessRoleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccessRole
     */
    select?: AccessRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccessRole
     */
    omit?: AccessRoleOmit<ExtArgs> | null
    /**
     * Filter, which AccessRole to fetch.
     */
    where?: AccessRoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AccessRoles to fetch.
     */
    orderBy?: AccessRoleOrderByWithRelationInput | AccessRoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AccessRoles.
     */
    cursor?: AccessRoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AccessRoles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AccessRoles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AccessRoles.
     */
    distinct?: AccessRoleScalarFieldEnum | AccessRoleScalarFieldEnum[]
  }

  /**
   * AccessRole findFirstOrThrow
   */
  export type AccessRoleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccessRole
     */
    select?: AccessRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccessRole
     */
    omit?: AccessRoleOmit<ExtArgs> | null
    /**
     * Filter, which AccessRole to fetch.
     */
    where?: AccessRoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AccessRoles to fetch.
     */
    orderBy?: AccessRoleOrderByWithRelationInput | AccessRoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AccessRoles.
     */
    cursor?: AccessRoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AccessRoles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AccessRoles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AccessRoles.
     */
    distinct?: AccessRoleScalarFieldEnum | AccessRoleScalarFieldEnum[]
  }

  /**
   * AccessRole findMany
   */
  export type AccessRoleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccessRole
     */
    select?: AccessRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccessRole
     */
    omit?: AccessRoleOmit<ExtArgs> | null
    /**
     * Filter, which AccessRoles to fetch.
     */
    where?: AccessRoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AccessRoles to fetch.
     */
    orderBy?: AccessRoleOrderByWithRelationInput | AccessRoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AccessRoles.
     */
    cursor?: AccessRoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AccessRoles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AccessRoles.
     */
    skip?: number
    distinct?: AccessRoleScalarFieldEnum | AccessRoleScalarFieldEnum[]
  }

  /**
   * AccessRole create
   */
  export type AccessRoleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccessRole
     */
    select?: AccessRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccessRole
     */
    omit?: AccessRoleOmit<ExtArgs> | null
    /**
     * The data needed to create a AccessRole.
     */
    data: XOR<AccessRoleCreateInput, AccessRoleUncheckedCreateInput>
  }

  /**
   * AccessRole createMany
   */
  export type AccessRoleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AccessRoles.
     */
    data: AccessRoleCreateManyInput | AccessRoleCreateManyInput[]
  }

  /**
   * AccessRole update
   */
  export type AccessRoleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccessRole
     */
    select?: AccessRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccessRole
     */
    omit?: AccessRoleOmit<ExtArgs> | null
    /**
     * The data needed to update a AccessRole.
     */
    data: XOR<AccessRoleUpdateInput, AccessRoleUncheckedUpdateInput>
    /**
     * Choose, which AccessRole to update.
     */
    where: AccessRoleWhereUniqueInput
  }

  /**
   * AccessRole updateMany
   */
  export type AccessRoleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AccessRoles.
     */
    data: XOR<AccessRoleUpdateManyMutationInput, AccessRoleUncheckedUpdateManyInput>
    /**
     * Filter which AccessRoles to update
     */
    where?: AccessRoleWhereInput
    /**
     * Limit how many AccessRoles to update.
     */
    limit?: number
  }

  /**
   * AccessRole upsert
   */
  export type AccessRoleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccessRole
     */
    select?: AccessRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccessRole
     */
    omit?: AccessRoleOmit<ExtArgs> | null
    /**
     * The filter to search for the AccessRole to update in case it exists.
     */
    where: AccessRoleWhereUniqueInput
    /**
     * In case the AccessRole found by the `where` argument doesn't exist, create a new AccessRole with this data.
     */
    create: XOR<AccessRoleCreateInput, AccessRoleUncheckedCreateInput>
    /**
     * In case the AccessRole was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AccessRoleUpdateInput, AccessRoleUncheckedUpdateInput>
  }

  /**
   * AccessRole delete
   */
  export type AccessRoleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccessRole
     */
    select?: AccessRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccessRole
     */
    omit?: AccessRoleOmit<ExtArgs> | null
    /**
     * Filter which AccessRole to delete.
     */
    where: AccessRoleWhereUniqueInput
  }

  /**
   * AccessRole deleteMany
   */
  export type AccessRoleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AccessRoles to delete
     */
    where?: AccessRoleWhereInput
    /**
     * Limit how many AccessRoles to delete.
     */
    limit?: number
  }

  /**
   * AccessRole without action
   */
  export type AccessRoleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccessRole
     */
    select?: AccessRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccessRole
     */
    omit?: AccessRoleOmit<ExtArgs> | null
  }


  /**
   * Model MasterAccessRole
   */

  export type AggregateMasterAccessRole = {
    _count: MasterAccessRoleCountAggregateOutputType | null
    _avg: MasterAccessRoleAvgAggregateOutputType | null
    _sum: MasterAccessRoleSumAggregateOutputType | null
    _min: MasterAccessRoleMinAggregateOutputType | null
    _max: MasterAccessRoleMaxAggregateOutputType | null
  }

  export type MasterAccessRoleAvgAggregateOutputType = {
    orderIndex: number | null
  }

  export type MasterAccessRoleSumAggregateOutputType = {
    orderIndex: number | null
  }

  export type MasterAccessRoleMinAggregateOutputType = {
    masAccessId: string | null
    resourceType: string | null
    resourceKey: string | null
    displayName: string | null
    route: string | null
    parentKey: string | null
    orderIndex: number | null
    isActive: boolean | null
    isDeleted: boolean | null
    createdAt: Date | null
    createdBy: string | null
    updatedAt: Date | null
    updatedBy: string | null
    deletedAt: Date | null
    deletedBy: string | null
  }

  export type MasterAccessRoleMaxAggregateOutputType = {
    masAccessId: string | null
    resourceType: string | null
    resourceKey: string | null
    displayName: string | null
    route: string | null
    parentKey: string | null
    orderIndex: number | null
    isActive: boolean | null
    isDeleted: boolean | null
    createdAt: Date | null
    createdBy: string | null
    updatedAt: Date | null
    updatedBy: string | null
    deletedAt: Date | null
    deletedBy: string | null
  }

  export type MasterAccessRoleCountAggregateOutputType = {
    masAccessId: number
    resourceType: number
    resourceKey: number
    displayName: number
    route: number
    parentKey: number
    orderIndex: number
    isActive: number
    isDeleted: number
    createdAt: number
    createdBy: number
    updatedAt: number
    updatedBy: number
    deletedAt: number
    deletedBy: number
    _all: number
  }


  export type MasterAccessRoleAvgAggregateInputType = {
    orderIndex?: true
  }

  export type MasterAccessRoleSumAggregateInputType = {
    orderIndex?: true
  }

  export type MasterAccessRoleMinAggregateInputType = {
    masAccessId?: true
    resourceType?: true
    resourceKey?: true
    displayName?: true
    route?: true
    parentKey?: true
    orderIndex?: true
    isActive?: true
    isDeleted?: true
    createdAt?: true
    createdBy?: true
    updatedAt?: true
    updatedBy?: true
    deletedAt?: true
    deletedBy?: true
  }

  export type MasterAccessRoleMaxAggregateInputType = {
    masAccessId?: true
    resourceType?: true
    resourceKey?: true
    displayName?: true
    route?: true
    parentKey?: true
    orderIndex?: true
    isActive?: true
    isDeleted?: true
    createdAt?: true
    createdBy?: true
    updatedAt?: true
    updatedBy?: true
    deletedAt?: true
    deletedBy?: true
  }

  export type MasterAccessRoleCountAggregateInputType = {
    masAccessId?: true
    resourceType?: true
    resourceKey?: true
    displayName?: true
    route?: true
    parentKey?: true
    orderIndex?: true
    isActive?: true
    isDeleted?: true
    createdAt?: true
    createdBy?: true
    updatedAt?: true
    updatedBy?: true
    deletedAt?: true
    deletedBy?: true
    _all?: true
  }

  export type MasterAccessRoleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MasterAccessRole to aggregate.
     */
    where?: MasterAccessRoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MasterAccessRoles to fetch.
     */
    orderBy?: MasterAccessRoleOrderByWithRelationInput | MasterAccessRoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MasterAccessRoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MasterAccessRoles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MasterAccessRoles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MasterAccessRoles
    **/
    _count?: true | MasterAccessRoleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MasterAccessRoleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MasterAccessRoleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MasterAccessRoleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MasterAccessRoleMaxAggregateInputType
  }

  export type GetMasterAccessRoleAggregateType<T extends MasterAccessRoleAggregateArgs> = {
        [P in keyof T & keyof AggregateMasterAccessRole]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMasterAccessRole[P]>
      : GetScalarType<T[P], AggregateMasterAccessRole[P]>
  }




  export type MasterAccessRoleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MasterAccessRoleWhereInput
    orderBy?: MasterAccessRoleOrderByWithAggregationInput | MasterAccessRoleOrderByWithAggregationInput[]
    by: MasterAccessRoleScalarFieldEnum[] | MasterAccessRoleScalarFieldEnum
    having?: MasterAccessRoleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MasterAccessRoleCountAggregateInputType | true
    _avg?: MasterAccessRoleAvgAggregateInputType
    _sum?: MasterAccessRoleSumAggregateInputType
    _min?: MasterAccessRoleMinAggregateInputType
    _max?: MasterAccessRoleMaxAggregateInputType
  }

  export type MasterAccessRoleGroupByOutputType = {
    masAccessId: string
    resourceType: string
    resourceKey: string
    displayName: string
    route: string | null
    parentKey: string | null
    orderIndex: number
    isActive: boolean
    isDeleted: boolean
    createdAt: Date
    createdBy: string | null
    updatedAt: Date
    updatedBy: string | null
    deletedAt: Date | null
    deletedBy: string | null
    _count: MasterAccessRoleCountAggregateOutputType | null
    _avg: MasterAccessRoleAvgAggregateOutputType | null
    _sum: MasterAccessRoleSumAggregateOutputType | null
    _min: MasterAccessRoleMinAggregateOutputType | null
    _max: MasterAccessRoleMaxAggregateOutputType | null
  }

  type GetMasterAccessRoleGroupByPayload<T extends MasterAccessRoleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MasterAccessRoleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MasterAccessRoleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MasterAccessRoleGroupByOutputType[P]>
            : GetScalarType<T[P], MasterAccessRoleGroupByOutputType[P]>
        }
      >
    >


  export type MasterAccessRoleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    masAccessId?: boolean
    resourceType?: boolean
    resourceKey?: boolean
    displayName?: boolean
    route?: boolean
    parentKey?: boolean
    orderIndex?: boolean
    isActive?: boolean
    isDeleted?: boolean
    createdAt?: boolean
    createdBy?: boolean
    updatedAt?: boolean
    updatedBy?: boolean
    deletedAt?: boolean
    deletedBy?: boolean
  }, ExtArgs["result"]["masterAccessRole"]>



  export type MasterAccessRoleSelectScalar = {
    masAccessId?: boolean
    resourceType?: boolean
    resourceKey?: boolean
    displayName?: boolean
    route?: boolean
    parentKey?: boolean
    orderIndex?: boolean
    isActive?: boolean
    isDeleted?: boolean
    createdAt?: boolean
    createdBy?: boolean
    updatedAt?: boolean
    updatedBy?: boolean
    deletedAt?: boolean
    deletedBy?: boolean
  }

  export type MasterAccessRoleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"masAccessId" | "resourceType" | "resourceKey" | "displayName" | "route" | "parentKey" | "orderIndex" | "isActive" | "isDeleted" | "createdAt" | "createdBy" | "updatedAt" | "updatedBy" | "deletedAt" | "deletedBy", ExtArgs["result"]["masterAccessRole"]>

  export type $MasterAccessRolePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MasterAccessRole"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      masAccessId: string
      resourceType: string
      resourceKey: string
      displayName: string
      route: string | null
      parentKey: string | null
      orderIndex: number
      isActive: boolean
      isDeleted: boolean
      createdAt: Date
      createdBy: string | null
      updatedAt: Date
      updatedBy: string | null
      deletedAt: Date | null
      deletedBy: string | null
    }, ExtArgs["result"]["masterAccessRole"]>
    composites: {}
  }

  type MasterAccessRoleGetPayload<S extends boolean | null | undefined | MasterAccessRoleDefaultArgs> = $Result.GetResult<Prisma.$MasterAccessRolePayload, S>

  type MasterAccessRoleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MasterAccessRoleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MasterAccessRoleCountAggregateInputType | true
    }

  export interface MasterAccessRoleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MasterAccessRole'], meta: { name: 'MasterAccessRole' } }
    /**
     * Find zero or one MasterAccessRole that matches the filter.
     * @param {MasterAccessRoleFindUniqueArgs} args - Arguments to find a MasterAccessRole
     * @example
     * // Get one MasterAccessRole
     * const masterAccessRole = await prisma.masterAccessRole.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MasterAccessRoleFindUniqueArgs>(args: SelectSubset<T, MasterAccessRoleFindUniqueArgs<ExtArgs>>): Prisma__MasterAccessRoleClient<$Result.GetResult<Prisma.$MasterAccessRolePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MasterAccessRole that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MasterAccessRoleFindUniqueOrThrowArgs} args - Arguments to find a MasterAccessRole
     * @example
     * // Get one MasterAccessRole
     * const masterAccessRole = await prisma.masterAccessRole.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MasterAccessRoleFindUniqueOrThrowArgs>(args: SelectSubset<T, MasterAccessRoleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MasterAccessRoleClient<$Result.GetResult<Prisma.$MasterAccessRolePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MasterAccessRole that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MasterAccessRoleFindFirstArgs} args - Arguments to find a MasterAccessRole
     * @example
     * // Get one MasterAccessRole
     * const masterAccessRole = await prisma.masterAccessRole.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MasterAccessRoleFindFirstArgs>(args?: SelectSubset<T, MasterAccessRoleFindFirstArgs<ExtArgs>>): Prisma__MasterAccessRoleClient<$Result.GetResult<Prisma.$MasterAccessRolePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MasterAccessRole that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MasterAccessRoleFindFirstOrThrowArgs} args - Arguments to find a MasterAccessRole
     * @example
     * // Get one MasterAccessRole
     * const masterAccessRole = await prisma.masterAccessRole.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MasterAccessRoleFindFirstOrThrowArgs>(args?: SelectSubset<T, MasterAccessRoleFindFirstOrThrowArgs<ExtArgs>>): Prisma__MasterAccessRoleClient<$Result.GetResult<Prisma.$MasterAccessRolePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MasterAccessRoles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MasterAccessRoleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MasterAccessRoles
     * const masterAccessRoles = await prisma.masterAccessRole.findMany()
     * 
     * // Get first 10 MasterAccessRoles
     * const masterAccessRoles = await prisma.masterAccessRole.findMany({ take: 10 })
     * 
     * // Only select the `masAccessId`
     * const masterAccessRoleWithMasAccessIdOnly = await prisma.masterAccessRole.findMany({ select: { masAccessId: true } })
     * 
     */
    findMany<T extends MasterAccessRoleFindManyArgs>(args?: SelectSubset<T, MasterAccessRoleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MasterAccessRolePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MasterAccessRole.
     * @param {MasterAccessRoleCreateArgs} args - Arguments to create a MasterAccessRole.
     * @example
     * // Create one MasterAccessRole
     * const MasterAccessRole = await prisma.masterAccessRole.create({
     *   data: {
     *     // ... data to create a MasterAccessRole
     *   }
     * })
     * 
     */
    create<T extends MasterAccessRoleCreateArgs>(args: SelectSubset<T, MasterAccessRoleCreateArgs<ExtArgs>>): Prisma__MasterAccessRoleClient<$Result.GetResult<Prisma.$MasterAccessRolePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MasterAccessRoles.
     * @param {MasterAccessRoleCreateManyArgs} args - Arguments to create many MasterAccessRoles.
     * @example
     * // Create many MasterAccessRoles
     * const masterAccessRole = await prisma.masterAccessRole.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MasterAccessRoleCreateManyArgs>(args?: SelectSubset<T, MasterAccessRoleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a MasterAccessRole.
     * @param {MasterAccessRoleDeleteArgs} args - Arguments to delete one MasterAccessRole.
     * @example
     * // Delete one MasterAccessRole
     * const MasterAccessRole = await prisma.masterAccessRole.delete({
     *   where: {
     *     // ... filter to delete one MasterAccessRole
     *   }
     * })
     * 
     */
    delete<T extends MasterAccessRoleDeleteArgs>(args: SelectSubset<T, MasterAccessRoleDeleteArgs<ExtArgs>>): Prisma__MasterAccessRoleClient<$Result.GetResult<Prisma.$MasterAccessRolePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MasterAccessRole.
     * @param {MasterAccessRoleUpdateArgs} args - Arguments to update one MasterAccessRole.
     * @example
     * // Update one MasterAccessRole
     * const masterAccessRole = await prisma.masterAccessRole.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MasterAccessRoleUpdateArgs>(args: SelectSubset<T, MasterAccessRoleUpdateArgs<ExtArgs>>): Prisma__MasterAccessRoleClient<$Result.GetResult<Prisma.$MasterAccessRolePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MasterAccessRoles.
     * @param {MasterAccessRoleDeleteManyArgs} args - Arguments to filter MasterAccessRoles to delete.
     * @example
     * // Delete a few MasterAccessRoles
     * const { count } = await prisma.masterAccessRole.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MasterAccessRoleDeleteManyArgs>(args?: SelectSubset<T, MasterAccessRoleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MasterAccessRoles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MasterAccessRoleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MasterAccessRoles
     * const masterAccessRole = await prisma.masterAccessRole.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MasterAccessRoleUpdateManyArgs>(args: SelectSubset<T, MasterAccessRoleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one MasterAccessRole.
     * @param {MasterAccessRoleUpsertArgs} args - Arguments to update or create a MasterAccessRole.
     * @example
     * // Update or create a MasterAccessRole
     * const masterAccessRole = await prisma.masterAccessRole.upsert({
     *   create: {
     *     // ... data to create a MasterAccessRole
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MasterAccessRole we want to update
     *   }
     * })
     */
    upsert<T extends MasterAccessRoleUpsertArgs>(args: SelectSubset<T, MasterAccessRoleUpsertArgs<ExtArgs>>): Prisma__MasterAccessRoleClient<$Result.GetResult<Prisma.$MasterAccessRolePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MasterAccessRoles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MasterAccessRoleCountArgs} args - Arguments to filter MasterAccessRoles to count.
     * @example
     * // Count the number of MasterAccessRoles
     * const count = await prisma.masterAccessRole.count({
     *   where: {
     *     // ... the filter for the MasterAccessRoles we want to count
     *   }
     * })
    **/
    count<T extends MasterAccessRoleCountArgs>(
      args?: Subset<T, MasterAccessRoleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MasterAccessRoleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MasterAccessRole.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MasterAccessRoleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends MasterAccessRoleAggregateArgs>(args: Subset<T, MasterAccessRoleAggregateArgs>): Prisma.PrismaPromise<GetMasterAccessRoleAggregateType<T>>

    /**
     * Group by MasterAccessRole.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MasterAccessRoleGroupByArgs} args - Group by arguments.
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
      T extends MasterAccessRoleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MasterAccessRoleGroupByArgs['orderBy'] }
        : { orderBy?: MasterAccessRoleGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, MasterAccessRoleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMasterAccessRoleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MasterAccessRole model
   */
  readonly fields: MasterAccessRoleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MasterAccessRole.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MasterAccessRoleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the MasterAccessRole model
   */
  interface MasterAccessRoleFieldRefs {
    readonly masAccessId: FieldRef<"MasterAccessRole", 'String'>
    readonly resourceType: FieldRef<"MasterAccessRole", 'String'>
    readonly resourceKey: FieldRef<"MasterAccessRole", 'String'>
    readonly displayName: FieldRef<"MasterAccessRole", 'String'>
    readonly route: FieldRef<"MasterAccessRole", 'String'>
    readonly parentKey: FieldRef<"MasterAccessRole", 'String'>
    readonly orderIndex: FieldRef<"MasterAccessRole", 'Int'>
    readonly isActive: FieldRef<"MasterAccessRole", 'Boolean'>
    readonly isDeleted: FieldRef<"MasterAccessRole", 'Boolean'>
    readonly createdAt: FieldRef<"MasterAccessRole", 'DateTime'>
    readonly createdBy: FieldRef<"MasterAccessRole", 'String'>
    readonly updatedAt: FieldRef<"MasterAccessRole", 'DateTime'>
    readonly updatedBy: FieldRef<"MasterAccessRole", 'String'>
    readonly deletedAt: FieldRef<"MasterAccessRole", 'DateTime'>
    readonly deletedBy: FieldRef<"MasterAccessRole", 'String'>
  }
    

  // Custom InputTypes
  /**
   * MasterAccessRole findUnique
   */
  export type MasterAccessRoleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterAccessRole
     */
    select?: MasterAccessRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MasterAccessRole
     */
    omit?: MasterAccessRoleOmit<ExtArgs> | null
    /**
     * Filter, which MasterAccessRole to fetch.
     */
    where: MasterAccessRoleWhereUniqueInput
  }

  /**
   * MasterAccessRole findUniqueOrThrow
   */
  export type MasterAccessRoleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterAccessRole
     */
    select?: MasterAccessRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MasterAccessRole
     */
    omit?: MasterAccessRoleOmit<ExtArgs> | null
    /**
     * Filter, which MasterAccessRole to fetch.
     */
    where: MasterAccessRoleWhereUniqueInput
  }

  /**
   * MasterAccessRole findFirst
   */
  export type MasterAccessRoleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterAccessRole
     */
    select?: MasterAccessRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MasterAccessRole
     */
    omit?: MasterAccessRoleOmit<ExtArgs> | null
    /**
     * Filter, which MasterAccessRole to fetch.
     */
    where?: MasterAccessRoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MasterAccessRoles to fetch.
     */
    orderBy?: MasterAccessRoleOrderByWithRelationInput | MasterAccessRoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MasterAccessRoles.
     */
    cursor?: MasterAccessRoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MasterAccessRoles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MasterAccessRoles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MasterAccessRoles.
     */
    distinct?: MasterAccessRoleScalarFieldEnum | MasterAccessRoleScalarFieldEnum[]
  }

  /**
   * MasterAccessRole findFirstOrThrow
   */
  export type MasterAccessRoleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterAccessRole
     */
    select?: MasterAccessRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MasterAccessRole
     */
    omit?: MasterAccessRoleOmit<ExtArgs> | null
    /**
     * Filter, which MasterAccessRole to fetch.
     */
    where?: MasterAccessRoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MasterAccessRoles to fetch.
     */
    orderBy?: MasterAccessRoleOrderByWithRelationInput | MasterAccessRoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MasterAccessRoles.
     */
    cursor?: MasterAccessRoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MasterAccessRoles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MasterAccessRoles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MasterAccessRoles.
     */
    distinct?: MasterAccessRoleScalarFieldEnum | MasterAccessRoleScalarFieldEnum[]
  }

  /**
   * MasterAccessRole findMany
   */
  export type MasterAccessRoleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterAccessRole
     */
    select?: MasterAccessRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MasterAccessRole
     */
    omit?: MasterAccessRoleOmit<ExtArgs> | null
    /**
     * Filter, which MasterAccessRoles to fetch.
     */
    where?: MasterAccessRoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MasterAccessRoles to fetch.
     */
    orderBy?: MasterAccessRoleOrderByWithRelationInput | MasterAccessRoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MasterAccessRoles.
     */
    cursor?: MasterAccessRoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MasterAccessRoles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MasterAccessRoles.
     */
    skip?: number
    distinct?: MasterAccessRoleScalarFieldEnum | MasterAccessRoleScalarFieldEnum[]
  }

  /**
   * MasterAccessRole create
   */
  export type MasterAccessRoleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterAccessRole
     */
    select?: MasterAccessRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MasterAccessRole
     */
    omit?: MasterAccessRoleOmit<ExtArgs> | null
    /**
     * The data needed to create a MasterAccessRole.
     */
    data: XOR<MasterAccessRoleCreateInput, MasterAccessRoleUncheckedCreateInput>
  }

  /**
   * MasterAccessRole createMany
   */
  export type MasterAccessRoleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MasterAccessRoles.
     */
    data: MasterAccessRoleCreateManyInput | MasterAccessRoleCreateManyInput[]
  }

  /**
   * MasterAccessRole update
   */
  export type MasterAccessRoleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterAccessRole
     */
    select?: MasterAccessRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MasterAccessRole
     */
    omit?: MasterAccessRoleOmit<ExtArgs> | null
    /**
     * The data needed to update a MasterAccessRole.
     */
    data: XOR<MasterAccessRoleUpdateInput, MasterAccessRoleUncheckedUpdateInput>
    /**
     * Choose, which MasterAccessRole to update.
     */
    where: MasterAccessRoleWhereUniqueInput
  }

  /**
   * MasterAccessRole updateMany
   */
  export type MasterAccessRoleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MasterAccessRoles.
     */
    data: XOR<MasterAccessRoleUpdateManyMutationInput, MasterAccessRoleUncheckedUpdateManyInput>
    /**
     * Filter which MasterAccessRoles to update
     */
    where?: MasterAccessRoleWhereInput
    /**
     * Limit how many MasterAccessRoles to update.
     */
    limit?: number
  }

  /**
   * MasterAccessRole upsert
   */
  export type MasterAccessRoleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterAccessRole
     */
    select?: MasterAccessRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MasterAccessRole
     */
    omit?: MasterAccessRoleOmit<ExtArgs> | null
    /**
     * The filter to search for the MasterAccessRole to update in case it exists.
     */
    where: MasterAccessRoleWhereUniqueInput
    /**
     * In case the MasterAccessRole found by the `where` argument doesn't exist, create a new MasterAccessRole with this data.
     */
    create: XOR<MasterAccessRoleCreateInput, MasterAccessRoleUncheckedCreateInput>
    /**
     * In case the MasterAccessRole was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MasterAccessRoleUpdateInput, MasterAccessRoleUncheckedUpdateInput>
  }

  /**
   * MasterAccessRole delete
   */
  export type MasterAccessRoleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterAccessRole
     */
    select?: MasterAccessRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MasterAccessRole
     */
    omit?: MasterAccessRoleOmit<ExtArgs> | null
    /**
     * Filter which MasterAccessRole to delete.
     */
    where: MasterAccessRoleWhereUniqueInput
  }

  /**
   * MasterAccessRole deleteMany
   */
  export type MasterAccessRoleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MasterAccessRoles to delete
     */
    where?: MasterAccessRoleWhereInput
    /**
     * Limit how many MasterAccessRoles to delete.
     */
    limit?: number
  }

  /**
   * MasterAccessRole without action
   */
  export type MasterAccessRoleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterAccessRole
     */
    select?: MasterAccessRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MasterAccessRole
     */
    omit?: MasterAccessRoleOmit<ExtArgs> | null
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


  export const ChartScalarFieldEnum: {
    chartId: 'chartId',
    pilarId: 'pilarId',
    sbuId: 'sbuId',
    sbuSubId: 'sbuSubId',
    parentId: 'parentId',
    position: 'position',
    capacity: 'capacity',
    orderIndex: 'orderIndex',
    createdAt: 'createdAt',
    createdBy: 'createdBy',
    updatedAt: 'updatedAt',
    updatedBy: 'updatedBy',
    isDeleted: 'isDeleted',
    deletedAt: 'deletedAt',
    deletedBy: 'deletedBy',
    jobDesc: 'jobDesc'
  };

  export type ChartScalarFieldEnum = (typeof ChartScalarFieldEnum)[keyof typeof ChartScalarFieldEnum]


  export const ChartMemberScalarFieldEnum: {
    memberChartId: 'memberChartId',
    chartId: 'chartId',
    userId: 'userId',
    createdAt: 'createdAt',
    createdBy: 'createdBy',
    updatedAt: 'updatedAt',
    updatedBy: 'updatedBy',
    isDeleted: 'isDeleted',
    deletedAt: 'deletedAt',
    deletedBy: 'deletedBy',
    jabatan: 'jabatan'
  };

  export type ChartMemberScalarFieldEnum = (typeof ChartMemberScalarFieldEnum)[keyof typeof ChartMemberScalarFieldEnum]


  export const JabatanScalarFieldEnum: {
    jabatanId: 'jabatanId',
    jabatanName: 'jabatanName',
    jabatanLevel: 'jabatanLevel',
    jabatanDesc: 'jabatanDesc',
    jabatanIsActive: 'jabatanIsActive',
    createdAt: 'createdAt',
    createdBy: 'createdBy',
    updatedAt: 'updatedAt',
    updatedBy: 'updatedBy',
    isDeleted: 'isDeleted',
    deletedAt: 'deletedAt',
    deletedBy: 'deletedBy'
  };

  export type JabatanScalarFieldEnum = (typeof JabatanScalarFieldEnum)[keyof typeof JabatanScalarFieldEnum]


  export const AccessRoleScalarFieldEnum: {
    accessId: 'accessId',
    subjectType: 'subjectType',
    subjectId: 'subjectId',
    resourceType: 'resourceType',
    masAccessId: 'masAccessId',
    resourceKey: 'resourceKey',
    accessLevel: 'accessLevel',
    isActive: 'isActive',
    isDeleted: 'isDeleted',
    createdAt: 'createdAt',
    createdBy: 'createdBy',
    updatedAt: 'updatedAt',
    updatedBy: 'updatedBy',
    deletedAt: 'deletedAt',
    deletedBy: 'deletedBy'
  };

  export type AccessRoleScalarFieldEnum = (typeof AccessRoleScalarFieldEnum)[keyof typeof AccessRoleScalarFieldEnum]


  export const MasterAccessRoleScalarFieldEnum: {
    masAccessId: 'masAccessId',
    resourceType: 'resourceType',
    resourceKey: 'resourceKey',
    displayName: 'displayName',
    route: 'route',
    parentKey: 'parentKey',
    orderIndex: 'orderIndex',
    isActive: 'isActive',
    isDeleted: 'isDeleted',
    createdAt: 'createdAt',
    createdBy: 'createdBy',
    updatedAt: 'updatedAt',
    updatedBy: 'updatedBy',
    deletedAt: 'deletedAt',
    deletedBy: 'deletedBy'
  };

  export type MasterAccessRoleScalarFieldEnum = (typeof MasterAccessRoleScalarFieldEnum)[keyof typeof MasterAccessRoleScalarFieldEnum]


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
    deleter?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    updater?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
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
    deleter?: UserOrderByWithRelationInput
    updater?: UserOrderByWithRelationInput
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
    deleter?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    updater?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
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
    createdRoles?: RoleListRelationFilter
    deletedRoles?: RoleListRelationFilter
    updatedRoles?: RoleListRelationFilter
    creator?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    createdUsers?: UserListRelationFilter
    deleter?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    deletedUsers?: UserListRelationFilter
    role?: XOR<RoleScalarRelationFilter, RoleWhereInput>
    updater?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    updatedUsers?: UserListRelationFilter
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
    createdRoles?: RoleOrderByRelationAggregateInput
    deletedRoles?: RoleOrderByRelationAggregateInput
    updatedRoles?: RoleOrderByRelationAggregateInput
    creator?: UserOrderByWithRelationInput
    createdUsers?: UserOrderByRelationAggregateInput
    deleter?: UserOrderByWithRelationInput
    deletedUsers?: UserOrderByRelationAggregateInput
    role?: RoleOrderByWithRelationInput
    updater?: UserOrderByWithRelationInput
    updatedUsers?: UserOrderByRelationAggregateInput
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
    createdRoles?: RoleListRelationFilter
    deletedRoles?: RoleListRelationFilter
    updatedRoles?: RoleListRelationFilter
    creator?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    createdUsers?: UserListRelationFilter
    deleter?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    deletedUsers?: UserListRelationFilter
    role?: XOR<RoleScalarRelationFilter, RoleWhereInput>
    updater?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    updatedUsers?: UserListRelationFilter
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

  export type ChartWhereInput = {
    AND?: ChartWhereInput | ChartWhereInput[]
    OR?: ChartWhereInput[]
    NOT?: ChartWhereInput | ChartWhereInput[]
    chartId?: StringFilter<"Chart"> | string
    pilarId?: IntFilter<"Chart"> | number
    sbuId?: IntFilter<"Chart"> | number
    sbuSubId?: IntFilter<"Chart"> | number
    parentId?: StringNullableFilter<"Chart"> | string | null
    position?: StringFilter<"Chart"> | string
    capacity?: IntFilter<"Chart"> | number
    orderIndex?: IntFilter<"Chart"> | number
    createdAt?: DateTimeFilter<"Chart"> | Date | string
    createdBy?: StringNullableFilter<"Chart"> | string | null
    updatedAt?: DateTimeFilter<"Chart"> | Date | string
    updatedBy?: StringNullableFilter<"Chart"> | string | null
    isDeleted?: BoolFilter<"Chart"> | boolean
    deletedAt?: DateTimeNullableFilter<"Chart"> | Date | string | null
    deletedBy?: StringNullableFilter<"Chart"> | string | null
    jobDesc?: StringNullableFilter<"Chart"> | string | null
    parent?: XOR<ChartNullableScalarRelationFilter, ChartWhereInput> | null
    children?: ChartListRelationFilter
    members?: ChartMemberListRelationFilter
  }

  export type ChartOrderByWithRelationInput = {
    chartId?: SortOrder
    pilarId?: SortOrder
    sbuId?: SortOrder
    sbuSubId?: SortOrder
    parentId?: SortOrderInput | SortOrder
    position?: SortOrder
    capacity?: SortOrder
    orderIndex?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrderInput | SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    deletedBy?: SortOrderInput | SortOrder
    jobDesc?: SortOrderInput | SortOrder
    parent?: ChartOrderByWithRelationInput
    children?: ChartOrderByRelationAggregateInput
    members?: ChartMemberOrderByRelationAggregateInput
  }

  export type ChartWhereUniqueInput = Prisma.AtLeast<{
    chartId?: string
    AND?: ChartWhereInput | ChartWhereInput[]
    OR?: ChartWhereInput[]
    NOT?: ChartWhereInput | ChartWhereInput[]
    pilarId?: IntFilter<"Chart"> | number
    sbuId?: IntFilter<"Chart"> | number
    sbuSubId?: IntFilter<"Chart"> | number
    parentId?: StringNullableFilter<"Chart"> | string | null
    position?: StringFilter<"Chart"> | string
    capacity?: IntFilter<"Chart"> | number
    orderIndex?: IntFilter<"Chart"> | number
    createdAt?: DateTimeFilter<"Chart"> | Date | string
    createdBy?: StringNullableFilter<"Chart"> | string | null
    updatedAt?: DateTimeFilter<"Chart"> | Date | string
    updatedBy?: StringNullableFilter<"Chart"> | string | null
    isDeleted?: BoolFilter<"Chart"> | boolean
    deletedAt?: DateTimeNullableFilter<"Chart"> | Date | string | null
    deletedBy?: StringNullableFilter<"Chart"> | string | null
    jobDesc?: StringNullableFilter<"Chart"> | string | null
    parent?: XOR<ChartNullableScalarRelationFilter, ChartWhereInput> | null
    children?: ChartListRelationFilter
    members?: ChartMemberListRelationFilter
  }, "chartId">

  export type ChartOrderByWithAggregationInput = {
    chartId?: SortOrder
    pilarId?: SortOrder
    sbuId?: SortOrder
    sbuSubId?: SortOrder
    parentId?: SortOrderInput | SortOrder
    position?: SortOrder
    capacity?: SortOrder
    orderIndex?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrderInput | SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    deletedBy?: SortOrderInput | SortOrder
    jobDesc?: SortOrderInput | SortOrder
    _count?: ChartCountOrderByAggregateInput
    _avg?: ChartAvgOrderByAggregateInput
    _max?: ChartMaxOrderByAggregateInput
    _min?: ChartMinOrderByAggregateInput
    _sum?: ChartSumOrderByAggregateInput
  }

  export type ChartScalarWhereWithAggregatesInput = {
    AND?: ChartScalarWhereWithAggregatesInput | ChartScalarWhereWithAggregatesInput[]
    OR?: ChartScalarWhereWithAggregatesInput[]
    NOT?: ChartScalarWhereWithAggregatesInput | ChartScalarWhereWithAggregatesInput[]
    chartId?: StringWithAggregatesFilter<"Chart"> | string
    pilarId?: IntWithAggregatesFilter<"Chart"> | number
    sbuId?: IntWithAggregatesFilter<"Chart"> | number
    sbuSubId?: IntWithAggregatesFilter<"Chart"> | number
    parentId?: StringNullableWithAggregatesFilter<"Chart"> | string | null
    position?: StringWithAggregatesFilter<"Chart"> | string
    capacity?: IntWithAggregatesFilter<"Chart"> | number
    orderIndex?: IntWithAggregatesFilter<"Chart"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Chart"> | Date | string
    createdBy?: StringNullableWithAggregatesFilter<"Chart"> | string | null
    updatedAt?: DateTimeWithAggregatesFilter<"Chart"> | Date | string
    updatedBy?: StringNullableWithAggregatesFilter<"Chart"> | string | null
    isDeleted?: BoolWithAggregatesFilter<"Chart"> | boolean
    deletedAt?: DateTimeNullableWithAggregatesFilter<"Chart"> | Date | string | null
    deletedBy?: StringNullableWithAggregatesFilter<"Chart"> | string | null
    jobDesc?: StringNullableWithAggregatesFilter<"Chart"> | string | null
  }

  export type ChartMemberWhereInput = {
    AND?: ChartMemberWhereInput | ChartMemberWhereInput[]
    OR?: ChartMemberWhereInput[]
    NOT?: ChartMemberWhereInput | ChartMemberWhereInput[]
    memberChartId?: StringFilter<"ChartMember"> | string
    chartId?: StringFilter<"ChartMember"> | string
    userId?: IntNullableFilter<"ChartMember"> | number | null
    createdAt?: DateTimeFilter<"ChartMember"> | Date | string
    createdBy?: StringNullableFilter<"ChartMember"> | string | null
    updatedAt?: DateTimeFilter<"ChartMember"> | Date | string
    updatedBy?: StringNullableFilter<"ChartMember"> | string | null
    isDeleted?: BoolFilter<"ChartMember"> | boolean
    deletedAt?: DateTimeNullableFilter<"ChartMember"> | Date | string | null
    deletedBy?: StringNullableFilter<"ChartMember"> | string | null
    jabatan?: StringNullableFilter<"ChartMember"> | string | null
    node?: XOR<ChartScalarRelationFilter, ChartWhereInput>
  }

  export type ChartMemberOrderByWithRelationInput = {
    memberChartId?: SortOrder
    chartId?: SortOrder
    userId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrderInput | SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    deletedBy?: SortOrderInput | SortOrder
    jabatan?: SortOrderInput | SortOrder
    node?: ChartOrderByWithRelationInput
  }

  export type ChartMemberWhereUniqueInput = Prisma.AtLeast<{
    memberChartId?: string
    AND?: ChartMemberWhereInput | ChartMemberWhereInput[]
    OR?: ChartMemberWhereInput[]
    NOT?: ChartMemberWhereInput | ChartMemberWhereInput[]
    chartId?: StringFilter<"ChartMember"> | string
    userId?: IntNullableFilter<"ChartMember"> | number | null
    createdAt?: DateTimeFilter<"ChartMember"> | Date | string
    createdBy?: StringNullableFilter<"ChartMember"> | string | null
    updatedAt?: DateTimeFilter<"ChartMember"> | Date | string
    updatedBy?: StringNullableFilter<"ChartMember"> | string | null
    isDeleted?: BoolFilter<"ChartMember"> | boolean
    deletedAt?: DateTimeNullableFilter<"ChartMember"> | Date | string | null
    deletedBy?: StringNullableFilter<"ChartMember"> | string | null
    jabatan?: StringNullableFilter<"ChartMember"> | string | null
    node?: XOR<ChartScalarRelationFilter, ChartWhereInput>
  }, "memberChartId">

  export type ChartMemberOrderByWithAggregationInput = {
    memberChartId?: SortOrder
    chartId?: SortOrder
    userId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrderInput | SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    deletedBy?: SortOrderInput | SortOrder
    jabatan?: SortOrderInput | SortOrder
    _count?: ChartMemberCountOrderByAggregateInput
    _avg?: ChartMemberAvgOrderByAggregateInput
    _max?: ChartMemberMaxOrderByAggregateInput
    _min?: ChartMemberMinOrderByAggregateInput
    _sum?: ChartMemberSumOrderByAggregateInput
  }

  export type ChartMemberScalarWhereWithAggregatesInput = {
    AND?: ChartMemberScalarWhereWithAggregatesInput | ChartMemberScalarWhereWithAggregatesInput[]
    OR?: ChartMemberScalarWhereWithAggregatesInput[]
    NOT?: ChartMemberScalarWhereWithAggregatesInput | ChartMemberScalarWhereWithAggregatesInput[]
    memberChartId?: StringWithAggregatesFilter<"ChartMember"> | string
    chartId?: StringWithAggregatesFilter<"ChartMember"> | string
    userId?: IntNullableWithAggregatesFilter<"ChartMember"> | number | null
    createdAt?: DateTimeWithAggregatesFilter<"ChartMember"> | Date | string
    createdBy?: StringNullableWithAggregatesFilter<"ChartMember"> | string | null
    updatedAt?: DateTimeWithAggregatesFilter<"ChartMember"> | Date | string
    updatedBy?: StringNullableWithAggregatesFilter<"ChartMember"> | string | null
    isDeleted?: BoolWithAggregatesFilter<"ChartMember"> | boolean
    deletedAt?: DateTimeNullableWithAggregatesFilter<"ChartMember"> | Date | string | null
    deletedBy?: StringNullableWithAggregatesFilter<"ChartMember"> | string | null
    jabatan?: StringNullableWithAggregatesFilter<"ChartMember"> | string | null
  }

  export type jabatanWhereInput = {
    AND?: jabatanWhereInput | jabatanWhereInput[]
    OR?: jabatanWhereInput[]
    NOT?: jabatanWhereInput | jabatanWhereInput[]
    jabatanId?: StringFilter<"jabatan"> | string
    jabatanName?: StringFilter<"jabatan"> | string
    jabatanLevel?: IntFilter<"jabatan"> | number
    jabatanDesc?: StringNullableFilter<"jabatan"> | string | null
    jabatanIsActive?: BoolFilter<"jabatan"> | boolean
    createdAt?: DateTimeFilter<"jabatan"> | Date | string
    createdBy?: StringNullableFilter<"jabatan"> | string | null
    updatedAt?: DateTimeFilter<"jabatan"> | Date | string
    updatedBy?: StringNullableFilter<"jabatan"> | string | null
    isDeleted?: BoolFilter<"jabatan"> | boolean
    deletedAt?: DateTimeNullableFilter<"jabatan"> | Date | string | null
    deletedBy?: StringNullableFilter<"jabatan"> | string | null
  }

  export type jabatanOrderByWithRelationInput = {
    jabatanId?: SortOrder
    jabatanName?: SortOrder
    jabatanLevel?: SortOrder
    jabatanDesc?: SortOrderInput | SortOrder
    jabatanIsActive?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrderInput | SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    deletedBy?: SortOrderInput | SortOrder
  }

  export type jabatanWhereUniqueInput = Prisma.AtLeast<{
    jabatanId?: string
    AND?: jabatanWhereInput | jabatanWhereInput[]
    OR?: jabatanWhereInput[]
    NOT?: jabatanWhereInput | jabatanWhereInput[]
    jabatanName?: StringFilter<"jabatan"> | string
    jabatanLevel?: IntFilter<"jabatan"> | number
    jabatanDesc?: StringNullableFilter<"jabatan"> | string | null
    jabatanIsActive?: BoolFilter<"jabatan"> | boolean
    createdAt?: DateTimeFilter<"jabatan"> | Date | string
    createdBy?: StringNullableFilter<"jabatan"> | string | null
    updatedAt?: DateTimeFilter<"jabatan"> | Date | string
    updatedBy?: StringNullableFilter<"jabatan"> | string | null
    isDeleted?: BoolFilter<"jabatan"> | boolean
    deletedAt?: DateTimeNullableFilter<"jabatan"> | Date | string | null
    deletedBy?: StringNullableFilter<"jabatan"> | string | null
  }, "jabatanId">

  export type jabatanOrderByWithAggregationInput = {
    jabatanId?: SortOrder
    jabatanName?: SortOrder
    jabatanLevel?: SortOrder
    jabatanDesc?: SortOrderInput | SortOrder
    jabatanIsActive?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrderInput | SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    deletedBy?: SortOrderInput | SortOrder
    _count?: jabatanCountOrderByAggregateInput
    _avg?: jabatanAvgOrderByAggregateInput
    _max?: jabatanMaxOrderByAggregateInput
    _min?: jabatanMinOrderByAggregateInput
    _sum?: jabatanSumOrderByAggregateInput
  }

  export type jabatanScalarWhereWithAggregatesInput = {
    AND?: jabatanScalarWhereWithAggregatesInput | jabatanScalarWhereWithAggregatesInput[]
    OR?: jabatanScalarWhereWithAggregatesInput[]
    NOT?: jabatanScalarWhereWithAggregatesInput | jabatanScalarWhereWithAggregatesInput[]
    jabatanId?: StringWithAggregatesFilter<"jabatan"> | string
    jabatanName?: StringWithAggregatesFilter<"jabatan"> | string
    jabatanLevel?: IntWithAggregatesFilter<"jabatan"> | number
    jabatanDesc?: StringNullableWithAggregatesFilter<"jabatan"> | string | null
    jabatanIsActive?: BoolWithAggregatesFilter<"jabatan"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"jabatan"> | Date | string
    createdBy?: StringNullableWithAggregatesFilter<"jabatan"> | string | null
    updatedAt?: DateTimeWithAggregatesFilter<"jabatan"> | Date | string
    updatedBy?: StringNullableWithAggregatesFilter<"jabatan"> | string | null
    isDeleted?: BoolWithAggregatesFilter<"jabatan"> | boolean
    deletedAt?: DateTimeNullableWithAggregatesFilter<"jabatan"> | Date | string | null
    deletedBy?: StringNullableWithAggregatesFilter<"jabatan"> | string | null
  }

  export type AccessRoleWhereInput = {
    AND?: AccessRoleWhereInput | AccessRoleWhereInput[]
    OR?: AccessRoleWhereInput[]
    NOT?: AccessRoleWhereInput | AccessRoleWhereInput[]
    accessId?: StringFilter<"AccessRole"> | string
    subjectType?: StringFilter<"AccessRole"> | string
    subjectId?: StringFilter<"AccessRole"> | string
    resourceType?: StringFilter<"AccessRole"> | string
    masAccessId?: StringNullableFilter<"AccessRole"> | string | null
    resourceKey?: StringNullableFilter<"AccessRole"> | string | null
    accessLevel?: StringFilter<"AccessRole"> | string
    isActive?: BoolFilter<"AccessRole"> | boolean
    isDeleted?: BoolFilter<"AccessRole"> | boolean
    createdAt?: DateTimeFilter<"AccessRole"> | Date | string
    createdBy?: StringNullableFilter<"AccessRole"> | string | null
    updatedAt?: DateTimeFilter<"AccessRole"> | Date | string
    updatedBy?: StringNullableFilter<"AccessRole"> | string | null
    deletedAt?: DateTimeNullableFilter<"AccessRole"> | Date | string | null
    deletedBy?: StringNullableFilter<"AccessRole"> | string | null
  }

  export type AccessRoleOrderByWithRelationInput = {
    accessId?: SortOrder
    subjectType?: SortOrder
    subjectId?: SortOrder
    resourceType?: SortOrder
    masAccessId?: SortOrderInput | SortOrder
    resourceKey?: SortOrderInput | SortOrder
    accessLevel?: SortOrder
    isActive?: SortOrder
    isDeleted?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrderInput | SortOrder
    deletedAt?: SortOrderInput | SortOrder
    deletedBy?: SortOrderInput | SortOrder
  }

  export type AccessRoleWhereUniqueInput = Prisma.AtLeast<{
    accessId?: string
    subjectType_subjectId_resourceType_masAccessId_resourceKey?: AccessRoleSubjectTypeSubjectIdResourceTypeMasAccessIdResourceKeyCompoundUniqueInput
    AND?: AccessRoleWhereInput | AccessRoleWhereInput[]
    OR?: AccessRoleWhereInput[]
    NOT?: AccessRoleWhereInput | AccessRoleWhereInput[]
    subjectType?: StringFilter<"AccessRole"> | string
    subjectId?: StringFilter<"AccessRole"> | string
    resourceType?: StringFilter<"AccessRole"> | string
    masAccessId?: StringNullableFilter<"AccessRole"> | string | null
    resourceKey?: StringNullableFilter<"AccessRole"> | string | null
    accessLevel?: StringFilter<"AccessRole"> | string
    isActive?: BoolFilter<"AccessRole"> | boolean
    isDeleted?: BoolFilter<"AccessRole"> | boolean
    createdAt?: DateTimeFilter<"AccessRole"> | Date | string
    createdBy?: StringNullableFilter<"AccessRole"> | string | null
    updatedAt?: DateTimeFilter<"AccessRole"> | Date | string
    updatedBy?: StringNullableFilter<"AccessRole"> | string | null
    deletedAt?: DateTimeNullableFilter<"AccessRole"> | Date | string | null
    deletedBy?: StringNullableFilter<"AccessRole"> | string | null
  }, "accessId" | "subjectType_subjectId_resourceType_masAccessId_resourceKey">

  export type AccessRoleOrderByWithAggregationInput = {
    accessId?: SortOrder
    subjectType?: SortOrder
    subjectId?: SortOrder
    resourceType?: SortOrder
    masAccessId?: SortOrderInput | SortOrder
    resourceKey?: SortOrderInput | SortOrder
    accessLevel?: SortOrder
    isActive?: SortOrder
    isDeleted?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrderInput | SortOrder
    deletedAt?: SortOrderInput | SortOrder
    deletedBy?: SortOrderInput | SortOrder
    _count?: AccessRoleCountOrderByAggregateInput
    _max?: AccessRoleMaxOrderByAggregateInput
    _min?: AccessRoleMinOrderByAggregateInput
  }

  export type AccessRoleScalarWhereWithAggregatesInput = {
    AND?: AccessRoleScalarWhereWithAggregatesInput | AccessRoleScalarWhereWithAggregatesInput[]
    OR?: AccessRoleScalarWhereWithAggregatesInput[]
    NOT?: AccessRoleScalarWhereWithAggregatesInput | AccessRoleScalarWhereWithAggregatesInput[]
    accessId?: StringWithAggregatesFilter<"AccessRole"> | string
    subjectType?: StringWithAggregatesFilter<"AccessRole"> | string
    subjectId?: StringWithAggregatesFilter<"AccessRole"> | string
    resourceType?: StringWithAggregatesFilter<"AccessRole"> | string
    masAccessId?: StringNullableWithAggregatesFilter<"AccessRole"> | string | null
    resourceKey?: StringNullableWithAggregatesFilter<"AccessRole"> | string | null
    accessLevel?: StringWithAggregatesFilter<"AccessRole"> | string
    isActive?: BoolWithAggregatesFilter<"AccessRole"> | boolean
    isDeleted?: BoolWithAggregatesFilter<"AccessRole"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"AccessRole"> | Date | string
    createdBy?: StringNullableWithAggregatesFilter<"AccessRole"> | string | null
    updatedAt?: DateTimeWithAggregatesFilter<"AccessRole"> | Date | string
    updatedBy?: StringNullableWithAggregatesFilter<"AccessRole"> | string | null
    deletedAt?: DateTimeNullableWithAggregatesFilter<"AccessRole"> | Date | string | null
    deletedBy?: StringNullableWithAggregatesFilter<"AccessRole"> | string | null
  }

  export type MasterAccessRoleWhereInput = {
    AND?: MasterAccessRoleWhereInput | MasterAccessRoleWhereInput[]
    OR?: MasterAccessRoleWhereInput[]
    NOT?: MasterAccessRoleWhereInput | MasterAccessRoleWhereInput[]
    masAccessId?: StringFilter<"MasterAccessRole"> | string
    resourceType?: StringFilter<"MasterAccessRole"> | string
    resourceKey?: StringFilter<"MasterAccessRole"> | string
    displayName?: StringFilter<"MasterAccessRole"> | string
    route?: StringNullableFilter<"MasterAccessRole"> | string | null
    parentKey?: StringNullableFilter<"MasterAccessRole"> | string | null
    orderIndex?: IntFilter<"MasterAccessRole"> | number
    isActive?: BoolFilter<"MasterAccessRole"> | boolean
    isDeleted?: BoolFilter<"MasterAccessRole"> | boolean
    createdAt?: DateTimeFilter<"MasterAccessRole"> | Date | string
    createdBy?: StringNullableFilter<"MasterAccessRole"> | string | null
    updatedAt?: DateTimeFilter<"MasterAccessRole"> | Date | string
    updatedBy?: StringNullableFilter<"MasterAccessRole"> | string | null
    deletedAt?: DateTimeNullableFilter<"MasterAccessRole"> | Date | string | null
    deletedBy?: StringNullableFilter<"MasterAccessRole"> | string | null
  }

  export type MasterAccessRoleOrderByWithRelationInput = {
    masAccessId?: SortOrder
    resourceType?: SortOrder
    resourceKey?: SortOrder
    displayName?: SortOrder
    route?: SortOrderInput | SortOrder
    parentKey?: SortOrderInput | SortOrder
    orderIndex?: SortOrder
    isActive?: SortOrder
    isDeleted?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrderInput | SortOrder
    deletedAt?: SortOrderInput | SortOrder
    deletedBy?: SortOrderInput | SortOrder
  }

  export type MasterAccessRoleWhereUniqueInput = Prisma.AtLeast<{
    masAccessId?: string
    resourceType_resourceKey?: MasterAccessRoleResourceTypeResourceKeyCompoundUniqueInput
    AND?: MasterAccessRoleWhereInput | MasterAccessRoleWhereInput[]
    OR?: MasterAccessRoleWhereInput[]
    NOT?: MasterAccessRoleWhereInput | MasterAccessRoleWhereInput[]
    resourceType?: StringFilter<"MasterAccessRole"> | string
    resourceKey?: StringFilter<"MasterAccessRole"> | string
    displayName?: StringFilter<"MasterAccessRole"> | string
    route?: StringNullableFilter<"MasterAccessRole"> | string | null
    parentKey?: StringNullableFilter<"MasterAccessRole"> | string | null
    orderIndex?: IntFilter<"MasterAccessRole"> | number
    isActive?: BoolFilter<"MasterAccessRole"> | boolean
    isDeleted?: BoolFilter<"MasterAccessRole"> | boolean
    createdAt?: DateTimeFilter<"MasterAccessRole"> | Date | string
    createdBy?: StringNullableFilter<"MasterAccessRole"> | string | null
    updatedAt?: DateTimeFilter<"MasterAccessRole"> | Date | string
    updatedBy?: StringNullableFilter<"MasterAccessRole"> | string | null
    deletedAt?: DateTimeNullableFilter<"MasterAccessRole"> | Date | string | null
    deletedBy?: StringNullableFilter<"MasterAccessRole"> | string | null
  }, "masAccessId" | "resourceType_resourceKey">

  export type MasterAccessRoleOrderByWithAggregationInput = {
    masAccessId?: SortOrder
    resourceType?: SortOrder
    resourceKey?: SortOrder
    displayName?: SortOrder
    route?: SortOrderInput | SortOrder
    parentKey?: SortOrderInput | SortOrder
    orderIndex?: SortOrder
    isActive?: SortOrder
    isDeleted?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrderInput | SortOrder
    deletedAt?: SortOrderInput | SortOrder
    deletedBy?: SortOrderInput | SortOrder
    _count?: MasterAccessRoleCountOrderByAggregateInput
    _avg?: MasterAccessRoleAvgOrderByAggregateInput
    _max?: MasterAccessRoleMaxOrderByAggregateInput
    _min?: MasterAccessRoleMinOrderByAggregateInput
    _sum?: MasterAccessRoleSumOrderByAggregateInput
  }

  export type MasterAccessRoleScalarWhereWithAggregatesInput = {
    AND?: MasterAccessRoleScalarWhereWithAggregatesInput | MasterAccessRoleScalarWhereWithAggregatesInput[]
    OR?: MasterAccessRoleScalarWhereWithAggregatesInput[]
    NOT?: MasterAccessRoleScalarWhereWithAggregatesInput | MasterAccessRoleScalarWhereWithAggregatesInput[]
    masAccessId?: StringWithAggregatesFilter<"MasterAccessRole"> | string
    resourceType?: StringWithAggregatesFilter<"MasterAccessRole"> | string
    resourceKey?: StringWithAggregatesFilter<"MasterAccessRole"> | string
    displayName?: StringWithAggregatesFilter<"MasterAccessRole"> | string
    route?: StringNullableWithAggregatesFilter<"MasterAccessRole"> | string | null
    parentKey?: StringNullableWithAggregatesFilter<"MasterAccessRole"> | string | null
    orderIndex?: IntWithAggregatesFilter<"MasterAccessRole"> | number
    isActive?: BoolWithAggregatesFilter<"MasterAccessRole"> | boolean
    isDeleted?: BoolWithAggregatesFilter<"MasterAccessRole"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"MasterAccessRole"> | Date | string
    createdBy?: StringNullableWithAggregatesFilter<"MasterAccessRole"> | string | null
    updatedAt?: DateTimeWithAggregatesFilter<"MasterAccessRole"> | Date | string
    updatedBy?: StringNullableWithAggregatesFilter<"MasterAccessRole"> | string | null
    deletedAt?: DateTimeNullableWithAggregatesFilter<"MasterAccessRole"> | Date | string | null
    deletedBy?: StringNullableWithAggregatesFilter<"MasterAccessRole"> | string | null
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
    deleter?: UserCreateNestedOneWithoutDeletedRolesInput
    updater?: UserCreateNestedOneWithoutUpdatedRolesInput
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
    deleter?: UserUpdateOneWithoutDeletedRolesNestedInput
    updater?: UserUpdateOneWithoutUpdatedRolesNestedInput
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
    createdRoles?: RoleCreateNestedManyWithoutCreatorInput
    deletedRoles?: RoleCreateNestedManyWithoutDeleterInput
    updatedRoles?: RoleCreateNestedManyWithoutUpdaterInput
    creator?: UserCreateNestedOneWithoutCreatedUsersInput
    createdUsers?: UserCreateNestedManyWithoutCreatorInput
    deleter?: UserCreateNestedOneWithoutDeletedUsersInput
    deletedUsers?: UserCreateNestedManyWithoutDeleterInput
    role: RoleCreateNestedOneWithoutUsersInput
    updater?: UserCreateNestedOneWithoutUpdatedUsersInput
    updatedUsers?: UserCreateNestedManyWithoutUpdaterInput
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
    createdRoles?: RoleUncheckedCreateNestedManyWithoutCreatorInput
    deletedRoles?: RoleUncheckedCreateNestedManyWithoutDeleterInput
    updatedRoles?: RoleUncheckedCreateNestedManyWithoutUpdaterInput
    createdUsers?: UserUncheckedCreateNestedManyWithoutCreatorInput
    deletedUsers?: UserUncheckedCreateNestedManyWithoutDeleterInput
    updatedUsers?: UserUncheckedCreateNestedManyWithoutUpdaterInput
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
    createdRoles?: RoleUpdateManyWithoutCreatorNestedInput
    deletedRoles?: RoleUpdateManyWithoutDeleterNestedInput
    updatedRoles?: RoleUpdateManyWithoutUpdaterNestedInput
    creator?: UserUpdateOneWithoutCreatedUsersNestedInput
    createdUsers?: UserUpdateManyWithoutCreatorNestedInput
    deleter?: UserUpdateOneWithoutDeletedUsersNestedInput
    deletedUsers?: UserUpdateManyWithoutDeleterNestedInput
    role?: RoleUpdateOneRequiredWithoutUsersNestedInput
    updater?: UserUpdateOneWithoutUpdatedUsersNestedInput
    updatedUsers?: UserUpdateManyWithoutUpdaterNestedInput
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
    createdRoles?: RoleUncheckedUpdateManyWithoutCreatorNestedInput
    deletedRoles?: RoleUncheckedUpdateManyWithoutDeleterNestedInput
    updatedRoles?: RoleUncheckedUpdateManyWithoutUpdaterNestedInput
    createdUsers?: UserUncheckedUpdateManyWithoutCreatorNestedInput
    deletedUsers?: UserUncheckedUpdateManyWithoutDeleterNestedInput
    updatedUsers?: UserUncheckedUpdateManyWithoutUpdaterNestedInput
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

  export type ChartCreateInput = {
    chartId: string
    pilarId: number
    sbuId: number
    sbuSubId: number
    position: string
    capacity?: number
    orderIndex?: number
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    jobDesc?: string | null
    parent?: ChartCreateNestedOneWithoutChildrenInput
    children?: ChartCreateNestedManyWithoutParentInput
    members?: ChartMemberCreateNestedManyWithoutNodeInput
  }

  export type ChartUncheckedCreateInput = {
    chartId: string
    pilarId: number
    sbuId: number
    sbuSubId: number
    parentId?: string | null
    position: string
    capacity?: number
    orderIndex?: number
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    jobDesc?: string | null
    children?: ChartUncheckedCreateNestedManyWithoutParentInput
    members?: ChartMemberUncheckedCreateNestedManyWithoutNodeInput
  }

  export type ChartUpdateInput = {
    chartId?: StringFieldUpdateOperationsInput | string
    pilarId?: IntFieldUpdateOperationsInput | number
    sbuId?: IntFieldUpdateOperationsInput | number
    sbuSubId?: IntFieldUpdateOperationsInput | number
    position?: StringFieldUpdateOperationsInput | string
    capacity?: IntFieldUpdateOperationsInput | number
    orderIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    jobDesc?: NullableStringFieldUpdateOperationsInput | string | null
    parent?: ChartUpdateOneWithoutChildrenNestedInput
    children?: ChartUpdateManyWithoutParentNestedInput
    members?: ChartMemberUpdateManyWithoutNodeNestedInput
  }

  export type ChartUncheckedUpdateInput = {
    chartId?: StringFieldUpdateOperationsInput | string
    pilarId?: IntFieldUpdateOperationsInput | number
    sbuId?: IntFieldUpdateOperationsInput | number
    sbuSubId?: IntFieldUpdateOperationsInput | number
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    capacity?: IntFieldUpdateOperationsInput | number
    orderIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    jobDesc?: NullableStringFieldUpdateOperationsInput | string | null
    children?: ChartUncheckedUpdateManyWithoutParentNestedInput
    members?: ChartMemberUncheckedUpdateManyWithoutNodeNestedInput
  }

  export type ChartCreateManyInput = {
    chartId: string
    pilarId: number
    sbuId: number
    sbuSubId: number
    parentId?: string | null
    position: string
    capacity?: number
    orderIndex?: number
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    jobDesc?: string | null
  }

  export type ChartUpdateManyMutationInput = {
    chartId?: StringFieldUpdateOperationsInput | string
    pilarId?: IntFieldUpdateOperationsInput | number
    sbuId?: IntFieldUpdateOperationsInput | number
    sbuSubId?: IntFieldUpdateOperationsInput | number
    position?: StringFieldUpdateOperationsInput | string
    capacity?: IntFieldUpdateOperationsInput | number
    orderIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    jobDesc?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ChartUncheckedUpdateManyInput = {
    chartId?: StringFieldUpdateOperationsInput | string
    pilarId?: IntFieldUpdateOperationsInput | number
    sbuId?: IntFieldUpdateOperationsInput | number
    sbuSubId?: IntFieldUpdateOperationsInput | number
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    capacity?: IntFieldUpdateOperationsInput | number
    orderIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    jobDesc?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ChartMemberCreateInput = {
    memberChartId: string
    userId?: number | null
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    jabatan?: string | null
    node: ChartCreateNestedOneWithoutMembersInput
  }

  export type ChartMemberUncheckedCreateInput = {
    memberChartId: string
    chartId: string
    userId?: number | null
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    jabatan?: string | null
  }

  export type ChartMemberUpdateInput = {
    memberChartId?: StringFieldUpdateOperationsInput | string
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    jabatan?: NullableStringFieldUpdateOperationsInput | string | null
    node?: ChartUpdateOneRequiredWithoutMembersNestedInput
  }

  export type ChartMemberUncheckedUpdateInput = {
    memberChartId?: StringFieldUpdateOperationsInput | string
    chartId?: StringFieldUpdateOperationsInput | string
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    jabatan?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ChartMemberCreateManyInput = {
    memberChartId: string
    chartId: string
    userId?: number | null
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    jabatan?: string | null
  }

  export type ChartMemberUpdateManyMutationInput = {
    memberChartId?: StringFieldUpdateOperationsInput | string
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    jabatan?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ChartMemberUncheckedUpdateManyInput = {
    memberChartId?: StringFieldUpdateOperationsInput | string
    chartId?: StringFieldUpdateOperationsInput | string
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    jabatan?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type jabatanCreateInput = {
    jabatanId: string
    jabatanName: string
    jabatanLevel: number
    jabatanDesc?: string | null
    jabatanIsActive: boolean
    createdAt: Date | string
    createdBy?: string | null
    updatedAt: Date | string
    updatedBy?: string | null
    isDeleted: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
  }

  export type jabatanUncheckedCreateInput = {
    jabatanId: string
    jabatanName: string
    jabatanLevel: number
    jabatanDesc?: string | null
    jabatanIsActive: boolean
    createdAt: Date | string
    createdBy?: string | null
    updatedAt: Date | string
    updatedBy?: string | null
    isDeleted: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
  }

  export type jabatanUpdateInput = {
    jabatanId?: StringFieldUpdateOperationsInput | string
    jabatanName?: StringFieldUpdateOperationsInput | string
    jabatanLevel?: IntFieldUpdateOperationsInput | number
    jabatanDesc?: NullableStringFieldUpdateOperationsInput | string | null
    jabatanIsActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type jabatanUncheckedUpdateInput = {
    jabatanId?: StringFieldUpdateOperationsInput | string
    jabatanName?: StringFieldUpdateOperationsInput | string
    jabatanLevel?: IntFieldUpdateOperationsInput | number
    jabatanDesc?: NullableStringFieldUpdateOperationsInput | string | null
    jabatanIsActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type jabatanCreateManyInput = {
    jabatanId: string
    jabatanName: string
    jabatanLevel: number
    jabatanDesc?: string | null
    jabatanIsActive: boolean
    createdAt: Date | string
    createdBy?: string | null
    updatedAt: Date | string
    updatedBy?: string | null
    isDeleted: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
  }

  export type jabatanUpdateManyMutationInput = {
    jabatanId?: StringFieldUpdateOperationsInput | string
    jabatanName?: StringFieldUpdateOperationsInput | string
    jabatanLevel?: IntFieldUpdateOperationsInput | number
    jabatanDesc?: NullableStringFieldUpdateOperationsInput | string | null
    jabatanIsActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type jabatanUncheckedUpdateManyInput = {
    jabatanId?: StringFieldUpdateOperationsInput | string
    jabatanName?: StringFieldUpdateOperationsInput | string
    jabatanLevel?: IntFieldUpdateOperationsInput | number
    jabatanDesc?: NullableStringFieldUpdateOperationsInput | string | null
    jabatanIsActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AccessRoleCreateInput = {
    accessId: string
    subjectType: string
    subjectId: string
    resourceType: string
    masAccessId?: string | null
    resourceKey?: string | null
    accessLevel: string
    isActive?: boolean
    isDeleted?: boolean
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    deletedAt?: Date | string | null
    deletedBy?: string | null
  }

  export type AccessRoleUncheckedCreateInput = {
    accessId: string
    subjectType: string
    subjectId: string
    resourceType: string
    masAccessId?: string | null
    resourceKey?: string | null
    accessLevel: string
    isActive?: boolean
    isDeleted?: boolean
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    deletedAt?: Date | string | null
    deletedBy?: string | null
  }

  export type AccessRoleUpdateInput = {
    accessId?: StringFieldUpdateOperationsInput | string
    subjectType?: StringFieldUpdateOperationsInput | string
    subjectId?: StringFieldUpdateOperationsInput | string
    resourceType?: StringFieldUpdateOperationsInput | string
    masAccessId?: NullableStringFieldUpdateOperationsInput | string | null
    resourceKey?: NullableStringFieldUpdateOperationsInput | string | null
    accessLevel?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AccessRoleUncheckedUpdateInput = {
    accessId?: StringFieldUpdateOperationsInput | string
    subjectType?: StringFieldUpdateOperationsInput | string
    subjectId?: StringFieldUpdateOperationsInput | string
    resourceType?: StringFieldUpdateOperationsInput | string
    masAccessId?: NullableStringFieldUpdateOperationsInput | string | null
    resourceKey?: NullableStringFieldUpdateOperationsInput | string | null
    accessLevel?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AccessRoleCreateManyInput = {
    accessId: string
    subjectType: string
    subjectId: string
    resourceType: string
    masAccessId?: string | null
    resourceKey?: string | null
    accessLevel: string
    isActive?: boolean
    isDeleted?: boolean
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    deletedAt?: Date | string | null
    deletedBy?: string | null
  }

  export type AccessRoleUpdateManyMutationInput = {
    accessId?: StringFieldUpdateOperationsInput | string
    subjectType?: StringFieldUpdateOperationsInput | string
    subjectId?: StringFieldUpdateOperationsInput | string
    resourceType?: StringFieldUpdateOperationsInput | string
    masAccessId?: NullableStringFieldUpdateOperationsInput | string | null
    resourceKey?: NullableStringFieldUpdateOperationsInput | string | null
    accessLevel?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AccessRoleUncheckedUpdateManyInput = {
    accessId?: StringFieldUpdateOperationsInput | string
    subjectType?: StringFieldUpdateOperationsInput | string
    subjectId?: StringFieldUpdateOperationsInput | string
    resourceType?: StringFieldUpdateOperationsInput | string
    masAccessId?: NullableStringFieldUpdateOperationsInput | string | null
    resourceKey?: NullableStringFieldUpdateOperationsInput | string | null
    accessLevel?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MasterAccessRoleCreateInput = {
    masAccessId: string
    resourceType: string
    resourceKey: string
    displayName: string
    route?: string | null
    parentKey?: string | null
    orderIndex?: number
    isActive?: boolean
    isDeleted?: boolean
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    deletedAt?: Date | string | null
    deletedBy?: string | null
  }

  export type MasterAccessRoleUncheckedCreateInput = {
    masAccessId: string
    resourceType: string
    resourceKey: string
    displayName: string
    route?: string | null
    parentKey?: string | null
    orderIndex?: number
    isActive?: boolean
    isDeleted?: boolean
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    deletedAt?: Date | string | null
    deletedBy?: string | null
  }

  export type MasterAccessRoleUpdateInput = {
    masAccessId?: StringFieldUpdateOperationsInput | string
    resourceType?: StringFieldUpdateOperationsInput | string
    resourceKey?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    route?: NullableStringFieldUpdateOperationsInput | string | null
    parentKey?: NullableStringFieldUpdateOperationsInput | string | null
    orderIndex?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MasterAccessRoleUncheckedUpdateInput = {
    masAccessId?: StringFieldUpdateOperationsInput | string
    resourceType?: StringFieldUpdateOperationsInput | string
    resourceKey?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    route?: NullableStringFieldUpdateOperationsInput | string | null
    parentKey?: NullableStringFieldUpdateOperationsInput | string | null
    orderIndex?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MasterAccessRoleCreateManyInput = {
    masAccessId: string
    resourceType: string
    resourceKey: string
    displayName: string
    route?: string | null
    parentKey?: string | null
    orderIndex?: number
    isActive?: boolean
    isDeleted?: boolean
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    deletedAt?: Date | string | null
    deletedBy?: string | null
  }

  export type MasterAccessRoleUpdateManyMutationInput = {
    masAccessId?: StringFieldUpdateOperationsInput | string
    resourceType?: StringFieldUpdateOperationsInput | string
    resourceKey?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    route?: NullableStringFieldUpdateOperationsInput | string | null
    parentKey?: NullableStringFieldUpdateOperationsInput | string | null
    orderIndex?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MasterAccessRoleUncheckedUpdateManyInput = {
    masAccessId?: StringFieldUpdateOperationsInput | string
    resourceType?: StringFieldUpdateOperationsInput | string
    resourceKey?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    route?: NullableStringFieldUpdateOperationsInput | string | null
    parentKey?: NullableStringFieldUpdateOperationsInput | string | null
    orderIndex?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
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

  export type RoleListRelationFilter = {
    every?: RoleWhereInput
    some?: RoleWhereInput
    none?: RoleWhereInput
  }

  export type RoleScalarRelationFilter = {
    is?: RoleWhereInput
    isNot?: RoleWhereInput
  }

  export type RoleOrderByRelationAggregateInput = {
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

  export type ChartNullableScalarRelationFilter = {
    is?: ChartWhereInput | null
    isNot?: ChartWhereInput | null
  }

  export type ChartListRelationFilter = {
    every?: ChartWhereInput
    some?: ChartWhereInput
    none?: ChartWhereInput
  }

  export type ChartMemberListRelationFilter = {
    every?: ChartMemberWhereInput
    some?: ChartMemberWhereInput
    none?: ChartMemberWhereInput
  }

  export type ChartOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ChartMemberOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ChartCountOrderByAggregateInput = {
    chartId?: SortOrder
    pilarId?: SortOrder
    sbuId?: SortOrder
    sbuSubId?: SortOrder
    parentId?: SortOrder
    position?: SortOrder
    capacity?: SortOrder
    orderIndex?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    deletedBy?: SortOrder
    jobDesc?: SortOrder
  }

  export type ChartAvgOrderByAggregateInput = {
    pilarId?: SortOrder
    sbuId?: SortOrder
    sbuSubId?: SortOrder
    capacity?: SortOrder
    orderIndex?: SortOrder
  }

  export type ChartMaxOrderByAggregateInput = {
    chartId?: SortOrder
    pilarId?: SortOrder
    sbuId?: SortOrder
    sbuSubId?: SortOrder
    parentId?: SortOrder
    position?: SortOrder
    capacity?: SortOrder
    orderIndex?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    deletedBy?: SortOrder
    jobDesc?: SortOrder
  }

  export type ChartMinOrderByAggregateInput = {
    chartId?: SortOrder
    pilarId?: SortOrder
    sbuId?: SortOrder
    sbuSubId?: SortOrder
    parentId?: SortOrder
    position?: SortOrder
    capacity?: SortOrder
    orderIndex?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    deletedBy?: SortOrder
    jobDesc?: SortOrder
  }

  export type ChartSumOrderByAggregateInput = {
    pilarId?: SortOrder
    sbuId?: SortOrder
    sbuSubId?: SortOrder
    capacity?: SortOrder
    orderIndex?: SortOrder
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type ChartScalarRelationFilter = {
    is?: ChartWhereInput
    isNot?: ChartWhereInput
  }

  export type ChartMemberCountOrderByAggregateInput = {
    memberChartId?: SortOrder
    chartId?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    deletedBy?: SortOrder
    jabatan?: SortOrder
  }

  export type ChartMemberAvgOrderByAggregateInput = {
    userId?: SortOrder
  }

  export type ChartMemberMaxOrderByAggregateInput = {
    memberChartId?: SortOrder
    chartId?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    deletedBy?: SortOrder
    jabatan?: SortOrder
  }

  export type ChartMemberMinOrderByAggregateInput = {
    memberChartId?: SortOrder
    chartId?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    deletedBy?: SortOrder
    jabatan?: SortOrder
  }

  export type ChartMemberSumOrderByAggregateInput = {
    userId?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type jabatanCountOrderByAggregateInput = {
    jabatanId?: SortOrder
    jabatanName?: SortOrder
    jabatanLevel?: SortOrder
    jabatanDesc?: SortOrder
    jabatanIsActive?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    deletedBy?: SortOrder
  }

  export type jabatanAvgOrderByAggregateInput = {
    jabatanLevel?: SortOrder
  }

  export type jabatanMaxOrderByAggregateInput = {
    jabatanId?: SortOrder
    jabatanName?: SortOrder
    jabatanLevel?: SortOrder
    jabatanDesc?: SortOrder
    jabatanIsActive?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    deletedBy?: SortOrder
  }

  export type jabatanMinOrderByAggregateInput = {
    jabatanId?: SortOrder
    jabatanName?: SortOrder
    jabatanLevel?: SortOrder
    jabatanDesc?: SortOrder
    jabatanIsActive?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    deletedBy?: SortOrder
  }

  export type jabatanSumOrderByAggregateInput = {
    jabatanLevel?: SortOrder
  }

  export type AccessRoleSubjectTypeSubjectIdResourceTypeMasAccessIdResourceKeyCompoundUniqueInput = {
    subjectType: string
    subjectId: string
    resourceType: string
    masAccessId: string
    resourceKey: string
  }

  export type AccessRoleCountOrderByAggregateInput = {
    accessId?: SortOrder
    subjectType?: SortOrder
    subjectId?: SortOrder
    resourceType?: SortOrder
    masAccessId?: SortOrder
    resourceKey?: SortOrder
    accessLevel?: SortOrder
    isActive?: SortOrder
    isDeleted?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
    deletedAt?: SortOrder
    deletedBy?: SortOrder
  }

  export type AccessRoleMaxOrderByAggregateInput = {
    accessId?: SortOrder
    subjectType?: SortOrder
    subjectId?: SortOrder
    resourceType?: SortOrder
    masAccessId?: SortOrder
    resourceKey?: SortOrder
    accessLevel?: SortOrder
    isActive?: SortOrder
    isDeleted?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
    deletedAt?: SortOrder
    deletedBy?: SortOrder
  }

  export type AccessRoleMinOrderByAggregateInput = {
    accessId?: SortOrder
    subjectType?: SortOrder
    subjectId?: SortOrder
    resourceType?: SortOrder
    masAccessId?: SortOrder
    resourceKey?: SortOrder
    accessLevel?: SortOrder
    isActive?: SortOrder
    isDeleted?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
    deletedAt?: SortOrder
    deletedBy?: SortOrder
  }

  export type MasterAccessRoleResourceTypeResourceKeyCompoundUniqueInput = {
    resourceType: string
    resourceKey: string
  }

  export type MasterAccessRoleCountOrderByAggregateInput = {
    masAccessId?: SortOrder
    resourceType?: SortOrder
    resourceKey?: SortOrder
    displayName?: SortOrder
    route?: SortOrder
    parentKey?: SortOrder
    orderIndex?: SortOrder
    isActive?: SortOrder
    isDeleted?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
    deletedAt?: SortOrder
    deletedBy?: SortOrder
  }

  export type MasterAccessRoleAvgOrderByAggregateInput = {
    orderIndex?: SortOrder
  }

  export type MasterAccessRoleMaxOrderByAggregateInput = {
    masAccessId?: SortOrder
    resourceType?: SortOrder
    resourceKey?: SortOrder
    displayName?: SortOrder
    route?: SortOrder
    parentKey?: SortOrder
    orderIndex?: SortOrder
    isActive?: SortOrder
    isDeleted?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
    deletedAt?: SortOrder
    deletedBy?: SortOrder
  }

  export type MasterAccessRoleMinOrderByAggregateInput = {
    masAccessId?: SortOrder
    resourceType?: SortOrder
    resourceKey?: SortOrder
    displayName?: SortOrder
    route?: SortOrder
    parentKey?: SortOrder
    orderIndex?: SortOrder
    isActive?: SortOrder
    isDeleted?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
    deletedAt?: SortOrder
    deletedBy?: SortOrder
  }

  export type MasterAccessRoleSumOrderByAggregateInput = {
    orderIndex?: SortOrder
  }

  export type UserCreateNestedOneWithoutCreatedRolesInput = {
    create?: XOR<UserCreateWithoutCreatedRolesInput, UserUncheckedCreateWithoutCreatedRolesInput>
    connectOrCreate?: UserCreateOrConnectWithoutCreatedRolesInput
    connect?: UserWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutDeletedRolesInput = {
    create?: XOR<UserCreateWithoutDeletedRolesInput, UserUncheckedCreateWithoutDeletedRolesInput>
    connectOrCreate?: UserCreateOrConnectWithoutDeletedRolesInput
    connect?: UserWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutUpdatedRolesInput = {
    create?: XOR<UserCreateWithoutUpdatedRolesInput, UserUncheckedCreateWithoutUpdatedRolesInput>
    connectOrCreate?: UserCreateOrConnectWithoutUpdatedRolesInput
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

  export type UserUpdateOneWithoutDeletedRolesNestedInput = {
    create?: XOR<UserCreateWithoutDeletedRolesInput, UserUncheckedCreateWithoutDeletedRolesInput>
    connectOrCreate?: UserCreateOrConnectWithoutDeletedRolesInput
    upsert?: UserUpsertWithoutDeletedRolesInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutDeletedRolesInput, UserUpdateWithoutDeletedRolesInput>, UserUncheckedUpdateWithoutDeletedRolesInput>
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

  export type RoleCreateNestedManyWithoutCreatorInput = {
    create?: XOR<RoleCreateWithoutCreatorInput, RoleUncheckedCreateWithoutCreatorInput> | RoleCreateWithoutCreatorInput[] | RoleUncheckedCreateWithoutCreatorInput[]
    connectOrCreate?: RoleCreateOrConnectWithoutCreatorInput | RoleCreateOrConnectWithoutCreatorInput[]
    createMany?: RoleCreateManyCreatorInputEnvelope
    connect?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
  }

  export type RoleCreateNestedManyWithoutDeleterInput = {
    create?: XOR<RoleCreateWithoutDeleterInput, RoleUncheckedCreateWithoutDeleterInput> | RoleCreateWithoutDeleterInput[] | RoleUncheckedCreateWithoutDeleterInput[]
    connectOrCreate?: RoleCreateOrConnectWithoutDeleterInput | RoleCreateOrConnectWithoutDeleterInput[]
    createMany?: RoleCreateManyDeleterInputEnvelope
    connect?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
  }

  export type RoleCreateNestedManyWithoutUpdaterInput = {
    create?: XOR<RoleCreateWithoutUpdaterInput, RoleUncheckedCreateWithoutUpdaterInput> | RoleCreateWithoutUpdaterInput[] | RoleUncheckedCreateWithoutUpdaterInput[]
    connectOrCreate?: RoleCreateOrConnectWithoutUpdaterInput | RoleCreateOrConnectWithoutUpdaterInput[]
    createMany?: RoleCreateManyUpdaterInputEnvelope
    connect?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
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

  export type RoleUncheckedCreateNestedManyWithoutCreatorInput = {
    create?: XOR<RoleCreateWithoutCreatorInput, RoleUncheckedCreateWithoutCreatorInput> | RoleCreateWithoutCreatorInput[] | RoleUncheckedCreateWithoutCreatorInput[]
    connectOrCreate?: RoleCreateOrConnectWithoutCreatorInput | RoleCreateOrConnectWithoutCreatorInput[]
    createMany?: RoleCreateManyCreatorInputEnvelope
    connect?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
  }

  export type RoleUncheckedCreateNestedManyWithoutDeleterInput = {
    create?: XOR<RoleCreateWithoutDeleterInput, RoleUncheckedCreateWithoutDeleterInput> | RoleCreateWithoutDeleterInput[] | RoleUncheckedCreateWithoutDeleterInput[]
    connectOrCreate?: RoleCreateOrConnectWithoutDeleterInput | RoleCreateOrConnectWithoutDeleterInput[]
    createMany?: RoleCreateManyDeleterInputEnvelope
    connect?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
  }

  export type RoleUncheckedCreateNestedManyWithoutUpdaterInput = {
    create?: XOR<RoleCreateWithoutUpdaterInput, RoleUncheckedCreateWithoutUpdaterInput> | RoleCreateWithoutUpdaterInput[] | RoleUncheckedCreateWithoutUpdaterInput[]
    connectOrCreate?: RoleCreateOrConnectWithoutUpdaterInput | RoleCreateOrConnectWithoutUpdaterInput[]
    createMany?: RoleCreateManyUpdaterInputEnvelope
    connect?: RoleWhereUniqueInput | RoleWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutCreatorInput = {
    create?: XOR<UserCreateWithoutCreatorInput, UserUncheckedCreateWithoutCreatorInput> | UserCreateWithoutCreatorInput[] | UserUncheckedCreateWithoutCreatorInput[]
    connectOrCreate?: UserCreateOrConnectWithoutCreatorInput | UserCreateOrConnectWithoutCreatorInput[]
    createMany?: UserCreateManyCreatorInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutDeleterInput = {
    create?: XOR<UserCreateWithoutDeleterInput, UserUncheckedCreateWithoutDeleterInput> | UserCreateWithoutDeleterInput[] | UserUncheckedCreateWithoutDeleterInput[]
    connectOrCreate?: UserCreateOrConnectWithoutDeleterInput | UserCreateOrConnectWithoutDeleterInput[]
    createMany?: UserCreateManyDeleterInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutUpdaterInput = {
    create?: XOR<UserCreateWithoutUpdaterInput, UserUncheckedCreateWithoutUpdaterInput> | UserCreateWithoutUpdaterInput[] | UserUncheckedCreateWithoutUpdaterInput[]
    connectOrCreate?: UserCreateOrConnectWithoutUpdaterInput | UserCreateOrConnectWithoutUpdaterInput[]
    createMany?: UserCreateManyUpdaterInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
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

  export type ChartCreateNestedOneWithoutChildrenInput = {
    create?: XOR<ChartCreateWithoutChildrenInput, ChartUncheckedCreateWithoutChildrenInput>
    connectOrCreate?: ChartCreateOrConnectWithoutChildrenInput
    connect?: ChartWhereUniqueInput
  }

  export type ChartCreateNestedManyWithoutParentInput = {
    create?: XOR<ChartCreateWithoutParentInput, ChartUncheckedCreateWithoutParentInput> | ChartCreateWithoutParentInput[] | ChartUncheckedCreateWithoutParentInput[]
    connectOrCreate?: ChartCreateOrConnectWithoutParentInput | ChartCreateOrConnectWithoutParentInput[]
    createMany?: ChartCreateManyParentInputEnvelope
    connect?: ChartWhereUniqueInput | ChartWhereUniqueInput[]
  }

  export type ChartMemberCreateNestedManyWithoutNodeInput = {
    create?: XOR<ChartMemberCreateWithoutNodeInput, ChartMemberUncheckedCreateWithoutNodeInput> | ChartMemberCreateWithoutNodeInput[] | ChartMemberUncheckedCreateWithoutNodeInput[]
    connectOrCreate?: ChartMemberCreateOrConnectWithoutNodeInput | ChartMemberCreateOrConnectWithoutNodeInput[]
    createMany?: ChartMemberCreateManyNodeInputEnvelope
    connect?: ChartMemberWhereUniqueInput | ChartMemberWhereUniqueInput[]
  }

  export type ChartUncheckedCreateNestedManyWithoutParentInput = {
    create?: XOR<ChartCreateWithoutParentInput, ChartUncheckedCreateWithoutParentInput> | ChartCreateWithoutParentInput[] | ChartUncheckedCreateWithoutParentInput[]
    connectOrCreate?: ChartCreateOrConnectWithoutParentInput | ChartCreateOrConnectWithoutParentInput[]
    createMany?: ChartCreateManyParentInputEnvelope
    connect?: ChartWhereUniqueInput | ChartWhereUniqueInput[]
  }

  export type ChartMemberUncheckedCreateNestedManyWithoutNodeInput = {
    create?: XOR<ChartMemberCreateWithoutNodeInput, ChartMemberUncheckedCreateWithoutNodeInput> | ChartMemberCreateWithoutNodeInput[] | ChartMemberUncheckedCreateWithoutNodeInput[]
    connectOrCreate?: ChartMemberCreateOrConnectWithoutNodeInput | ChartMemberCreateOrConnectWithoutNodeInput[]
    createMany?: ChartMemberCreateManyNodeInputEnvelope
    connect?: ChartMemberWhereUniqueInput | ChartMemberWhereUniqueInput[]
  }

  export type ChartUpdateOneWithoutChildrenNestedInput = {
    create?: XOR<ChartCreateWithoutChildrenInput, ChartUncheckedCreateWithoutChildrenInput>
    connectOrCreate?: ChartCreateOrConnectWithoutChildrenInput
    upsert?: ChartUpsertWithoutChildrenInput
    disconnect?: ChartWhereInput | boolean
    delete?: ChartWhereInput | boolean
    connect?: ChartWhereUniqueInput
    update?: XOR<XOR<ChartUpdateToOneWithWhereWithoutChildrenInput, ChartUpdateWithoutChildrenInput>, ChartUncheckedUpdateWithoutChildrenInput>
  }

  export type ChartUpdateManyWithoutParentNestedInput = {
    create?: XOR<ChartCreateWithoutParentInput, ChartUncheckedCreateWithoutParentInput> | ChartCreateWithoutParentInput[] | ChartUncheckedCreateWithoutParentInput[]
    connectOrCreate?: ChartCreateOrConnectWithoutParentInput | ChartCreateOrConnectWithoutParentInput[]
    upsert?: ChartUpsertWithWhereUniqueWithoutParentInput | ChartUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: ChartCreateManyParentInputEnvelope
    set?: ChartWhereUniqueInput | ChartWhereUniqueInput[]
    disconnect?: ChartWhereUniqueInput | ChartWhereUniqueInput[]
    delete?: ChartWhereUniqueInput | ChartWhereUniqueInput[]
    connect?: ChartWhereUniqueInput | ChartWhereUniqueInput[]
    update?: ChartUpdateWithWhereUniqueWithoutParentInput | ChartUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: ChartUpdateManyWithWhereWithoutParentInput | ChartUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: ChartScalarWhereInput | ChartScalarWhereInput[]
  }

  export type ChartMemberUpdateManyWithoutNodeNestedInput = {
    create?: XOR<ChartMemberCreateWithoutNodeInput, ChartMemberUncheckedCreateWithoutNodeInput> | ChartMemberCreateWithoutNodeInput[] | ChartMemberUncheckedCreateWithoutNodeInput[]
    connectOrCreate?: ChartMemberCreateOrConnectWithoutNodeInput | ChartMemberCreateOrConnectWithoutNodeInput[]
    upsert?: ChartMemberUpsertWithWhereUniqueWithoutNodeInput | ChartMemberUpsertWithWhereUniqueWithoutNodeInput[]
    createMany?: ChartMemberCreateManyNodeInputEnvelope
    set?: ChartMemberWhereUniqueInput | ChartMemberWhereUniqueInput[]
    disconnect?: ChartMemberWhereUniqueInput | ChartMemberWhereUniqueInput[]
    delete?: ChartMemberWhereUniqueInput | ChartMemberWhereUniqueInput[]
    connect?: ChartMemberWhereUniqueInput | ChartMemberWhereUniqueInput[]
    update?: ChartMemberUpdateWithWhereUniqueWithoutNodeInput | ChartMemberUpdateWithWhereUniqueWithoutNodeInput[]
    updateMany?: ChartMemberUpdateManyWithWhereWithoutNodeInput | ChartMemberUpdateManyWithWhereWithoutNodeInput[]
    deleteMany?: ChartMemberScalarWhereInput | ChartMemberScalarWhereInput[]
  }

  export type ChartUncheckedUpdateManyWithoutParentNestedInput = {
    create?: XOR<ChartCreateWithoutParentInput, ChartUncheckedCreateWithoutParentInput> | ChartCreateWithoutParentInput[] | ChartUncheckedCreateWithoutParentInput[]
    connectOrCreate?: ChartCreateOrConnectWithoutParentInput | ChartCreateOrConnectWithoutParentInput[]
    upsert?: ChartUpsertWithWhereUniqueWithoutParentInput | ChartUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: ChartCreateManyParentInputEnvelope
    set?: ChartWhereUniqueInput | ChartWhereUniqueInput[]
    disconnect?: ChartWhereUniqueInput | ChartWhereUniqueInput[]
    delete?: ChartWhereUniqueInput | ChartWhereUniqueInput[]
    connect?: ChartWhereUniqueInput | ChartWhereUniqueInput[]
    update?: ChartUpdateWithWhereUniqueWithoutParentInput | ChartUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: ChartUpdateManyWithWhereWithoutParentInput | ChartUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: ChartScalarWhereInput | ChartScalarWhereInput[]
  }

  export type ChartMemberUncheckedUpdateManyWithoutNodeNestedInput = {
    create?: XOR<ChartMemberCreateWithoutNodeInput, ChartMemberUncheckedCreateWithoutNodeInput> | ChartMemberCreateWithoutNodeInput[] | ChartMemberUncheckedCreateWithoutNodeInput[]
    connectOrCreate?: ChartMemberCreateOrConnectWithoutNodeInput | ChartMemberCreateOrConnectWithoutNodeInput[]
    upsert?: ChartMemberUpsertWithWhereUniqueWithoutNodeInput | ChartMemberUpsertWithWhereUniqueWithoutNodeInput[]
    createMany?: ChartMemberCreateManyNodeInputEnvelope
    set?: ChartMemberWhereUniqueInput | ChartMemberWhereUniqueInput[]
    disconnect?: ChartMemberWhereUniqueInput | ChartMemberWhereUniqueInput[]
    delete?: ChartMemberWhereUniqueInput | ChartMemberWhereUniqueInput[]
    connect?: ChartMemberWhereUniqueInput | ChartMemberWhereUniqueInput[]
    update?: ChartMemberUpdateWithWhereUniqueWithoutNodeInput | ChartMemberUpdateWithWhereUniqueWithoutNodeInput[]
    updateMany?: ChartMemberUpdateManyWithWhereWithoutNodeInput | ChartMemberUpdateManyWithWhereWithoutNodeInput[]
    deleteMany?: ChartMemberScalarWhereInput | ChartMemberScalarWhereInput[]
  }

  export type ChartCreateNestedOneWithoutMembersInput = {
    create?: XOR<ChartCreateWithoutMembersInput, ChartUncheckedCreateWithoutMembersInput>
    connectOrCreate?: ChartCreateOrConnectWithoutMembersInput
    connect?: ChartWhereUniqueInput
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ChartUpdateOneRequiredWithoutMembersNestedInput = {
    create?: XOR<ChartCreateWithoutMembersInput, ChartUncheckedCreateWithoutMembersInput>
    connectOrCreate?: ChartCreateOrConnectWithoutMembersInput
    upsert?: ChartUpsertWithoutMembersInput
    connect?: ChartWhereUniqueInput
    update?: XOR<XOR<ChartUpdateToOneWithWhereWithoutMembersInput, ChartUpdateWithoutMembersInput>, ChartUncheckedUpdateWithoutMembersInput>
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

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
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
    deletedRoles?: RoleCreateNestedManyWithoutDeleterInput
    updatedRoles?: RoleCreateNestedManyWithoutUpdaterInput
    creator?: UserCreateNestedOneWithoutCreatedUsersInput
    createdUsers?: UserCreateNestedManyWithoutCreatorInput
    deleter?: UserCreateNestedOneWithoutDeletedUsersInput
    deletedUsers?: UserCreateNestedManyWithoutDeleterInput
    role: RoleCreateNestedOneWithoutUsersInput
    updater?: UserCreateNestedOneWithoutUpdatedUsersInput
    updatedUsers?: UserCreateNestedManyWithoutUpdaterInput
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
    deletedRoles?: RoleUncheckedCreateNestedManyWithoutDeleterInput
    updatedRoles?: RoleUncheckedCreateNestedManyWithoutUpdaterInput
    createdUsers?: UserUncheckedCreateNestedManyWithoutCreatorInput
    deletedUsers?: UserUncheckedCreateNestedManyWithoutDeleterInput
    updatedUsers?: UserUncheckedCreateNestedManyWithoutUpdaterInput
  }

  export type UserCreateOrConnectWithoutCreatedRolesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCreatedRolesInput, UserUncheckedCreateWithoutCreatedRolesInput>
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
    createdRoles?: RoleCreateNestedManyWithoutCreatorInput
    updatedRoles?: RoleCreateNestedManyWithoutUpdaterInput
    creator?: UserCreateNestedOneWithoutCreatedUsersInput
    createdUsers?: UserCreateNestedManyWithoutCreatorInput
    deleter?: UserCreateNestedOneWithoutDeletedUsersInput
    deletedUsers?: UserCreateNestedManyWithoutDeleterInput
    role: RoleCreateNestedOneWithoutUsersInput
    updater?: UserCreateNestedOneWithoutUpdatedUsersInput
    updatedUsers?: UserCreateNestedManyWithoutUpdaterInput
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
    createdRoles?: RoleUncheckedCreateNestedManyWithoutCreatorInput
    updatedRoles?: RoleUncheckedCreateNestedManyWithoutUpdaterInput
    createdUsers?: UserUncheckedCreateNestedManyWithoutCreatorInput
    deletedUsers?: UserUncheckedCreateNestedManyWithoutDeleterInput
    updatedUsers?: UserUncheckedCreateNestedManyWithoutUpdaterInput
  }

  export type UserCreateOrConnectWithoutDeletedRolesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutDeletedRolesInput, UserUncheckedCreateWithoutDeletedRolesInput>
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
    createdRoles?: RoleCreateNestedManyWithoutCreatorInput
    deletedRoles?: RoleCreateNestedManyWithoutDeleterInput
    creator?: UserCreateNestedOneWithoutCreatedUsersInput
    createdUsers?: UserCreateNestedManyWithoutCreatorInput
    deleter?: UserCreateNestedOneWithoutDeletedUsersInput
    deletedUsers?: UserCreateNestedManyWithoutDeleterInput
    role: RoleCreateNestedOneWithoutUsersInput
    updater?: UserCreateNestedOneWithoutUpdatedUsersInput
    updatedUsers?: UserCreateNestedManyWithoutUpdaterInput
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
    createdRoles?: RoleUncheckedCreateNestedManyWithoutCreatorInput
    deletedRoles?: RoleUncheckedCreateNestedManyWithoutDeleterInput
    createdUsers?: UserUncheckedCreateNestedManyWithoutCreatorInput
    deletedUsers?: UserUncheckedCreateNestedManyWithoutDeleterInput
    updatedUsers?: UserUncheckedCreateNestedManyWithoutUpdaterInput
  }

  export type UserCreateOrConnectWithoutUpdatedRolesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutUpdatedRolesInput, UserUncheckedCreateWithoutUpdatedRolesInput>
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
    createdRoles?: RoleCreateNestedManyWithoutCreatorInput
    deletedRoles?: RoleCreateNestedManyWithoutDeleterInput
    updatedRoles?: RoleCreateNestedManyWithoutUpdaterInput
    creator?: UserCreateNestedOneWithoutCreatedUsersInput
    createdUsers?: UserCreateNestedManyWithoutCreatorInput
    deleter?: UserCreateNestedOneWithoutDeletedUsersInput
    deletedUsers?: UserCreateNestedManyWithoutDeleterInput
    updater?: UserCreateNestedOneWithoutUpdatedUsersInput
    updatedUsers?: UserCreateNestedManyWithoutUpdaterInput
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
    createdRoles?: RoleUncheckedCreateNestedManyWithoutCreatorInput
    deletedRoles?: RoleUncheckedCreateNestedManyWithoutDeleterInput
    updatedRoles?: RoleUncheckedCreateNestedManyWithoutUpdaterInput
    createdUsers?: UserUncheckedCreateNestedManyWithoutCreatorInput
    deletedUsers?: UserUncheckedCreateNestedManyWithoutDeleterInput
    updatedUsers?: UserUncheckedCreateNestedManyWithoutUpdaterInput
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
    deletedRoles?: RoleUpdateManyWithoutDeleterNestedInput
    updatedRoles?: RoleUpdateManyWithoutUpdaterNestedInput
    creator?: UserUpdateOneWithoutCreatedUsersNestedInput
    createdUsers?: UserUpdateManyWithoutCreatorNestedInput
    deleter?: UserUpdateOneWithoutDeletedUsersNestedInput
    deletedUsers?: UserUpdateManyWithoutDeleterNestedInput
    role?: RoleUpdateOneRequiredWithoutUsersNestedInput
    updater?: UserUpdateOneWithoutUpdatedUsersNestedInput
    updatedUsers?: UserUpdateManyWithoutUpdaterNestedInput
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
    deletedRoles?: RoleUncheckedUpdateManyWithoutDeleterNestedInput
    updatedRoles?: RoleUncheckedUpdateManyWithoutUpdaterNestedInput
    createdUsers?: UserUncheckedUpdateManyWithoutCreatorNestedInput
    deletedUsers?: UserUncheckedUpdateManyWithoutDeleterNestedInput
    updatedUsers?: UserUncheckedUpdateManyWithoutUpdaterNestedInput
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
    createdRoles?: RoleUpdateManyWithoutCreatorNestedInput
    updatedRoles?: RoleUpdateManyWithoutUpdaterNestedInput
    creator?: UserUpdateOneWithoutCreatedUsersNestedInput
    createdUsers?: UserUpdateManyWithoutCreatorNestedInput
    deleter?: UserUpdateOneWithoutDeletedUsersNestedInput
    deletedUsers?: UserUpdateManyWithoutDeleterNestedInput
    role?: RoleUpdateOneRequiredWithoutUsersNestedInput
    updater?: UserUpdateOneWithoutUpdatedUsersNestedInput
    updatedUsers?: UserUpdateManyWithoutUpdaterNestedInput
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
    createdRoles?: RoleUncheckedUpdateManyWithoutCreatorNestedInput
    updatedRoles?: RoleUncheckedUpdateManyWithoutUpdaterNestedInput
    createdUsers?: UserUncheckedUpdateManyWithoutCreatorNestedInput
    deletedUsers?: UserUncheckedUpdateManyWithoutDeleterNestedInput
    updatedUsers?: UserUncheckedUpdateManyWithoutUpdaterNestedInput
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
    createdRoles?: RoleUpdateManyWithoutCreatorNestedInput
    deletedRoles?: RoleUpdateManyWithoutDeleterNestedInput
    creator?: UserUpdateOneWithoutCreatedUsersNestedInput
    createdUsers?: UserUpdateManyWithoutCreatorNestedInput
    deleter?: UserUpdateOneWithoutDeletedUsersNestedInput
    deletedUsers?: UserUpdateManyWithoutDeleterNestedInput
    role?: RoleUpdateOneRequiredWithoutUsersNestedInput
    updater?: UserUpdateOneWithoutUpdatedUsersNestedInput
    updatedUsers?: UserUpdateManyWithoutUpdaterNestedInput
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
    createdRoles?: RoleUncheckedUpdateManyWithoutCreatorNestedInput
    deletedRoles?: RoleUncheckedUpdateManyWithoutDeleterNestedInput
    createdUsers?: UserUncheckedUpdateManyWithoutCreatorNestedInput
    deletedUsers?: UserUncheckedUpdateManyWithoutDeleterNestedInput
    updatedUsers?: UserUncheckedUpdateManyWithoutUpdaterNestedInput
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
    deleter?: UserCreateNestedOneWithoutDeletedRolesInput
    updater?: UserCreateNestedOneWithoutUpdatedRolesInput
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
    createdRoles?: RoleCreateNestedManyWithoutCreatorInput
    deletedRoles?: RoleCreateNestedManyWithoutDeleterInput
    updatedRoles?: RoleCreateNestedManyWithoutUpdaterInput
    creator?: UserCreateNestedOneWithoutCreatedUsersInput
    deleter?: UserCreateNestedOneWithoutDeletedUsersInput
    deletedUsers?: UserCreateNestedManyWithoutDeleterInput
    role: RoleCreateNestedOneWithoutUsersInput
    updater?: UserCreateNestedOneWithoutUpdatedUsersInput
    updatedUsers?: UserCreateNestedManyWithoutUpdaterInput
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
    createdRoles?: RoleUncheckedCreateNestedManyWithoutCreatorInput
    deletedRoles?: RoleUncheckedCreateNestedManyWithoutDeleterInput
    updatedRoles?: RoleUncheckedCreateNestedManyWithoutUpdaterInput
    deletedUsers?: UserUncheckedCreateNestedManyWithoutDeleterInput
    updatedUsers?: UserUncheckedCreateNestedManyWithoutUpdaterInput
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
    createdRoles?: RoleCreateNestedManyWithoutCreatorInput
    deletedRoles?: RoleCreateNestedManyWithoutDeleterInput
    updatedRoles?: RoleCreateNestedManyWithoutUpdaterInput
    createdUsers?: UserCreateNestedManyWithoutCreatorInput
    deleter?: UserCreateNestedOneWithoutDeletedUsersInput
    deletedUsers?: UserCreateNestedManyWithoutDeleterInput
    role: RoleCreateNestedOneWithoutUsersInput
    updater?: UserCreateNestedOneWithoutUpdatedUsersInput
    updatedUsers?: UserCreateNestedManyWithoutUpdaterInput
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
    createdRoles?: RoleUncheckedCreateNestedManyWithoutCreatorInput
    deletedRoles?: RoleUncheckedCreateNestedManyWithoutDeleterInput
    updatedRoles?: RoleUncheckedCreateNestedManyWithoutUpdaterInput
    createdUsers?: UserUncheckedCreateNestedManyWithoutCreatorInput
    deletedUsers?: UserUncheckedCreateNestedManyWithoutDeleterInput
    updatedUsers?: UserUncheckedCreateNestedManyWithoutUpdaterInput
  }

  export type UserCreateOrConnectWithoutCreatorInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCreatorInput, UserUncheckedCreateWithoutCreatorInput>
  }

  export type UserCreateManyCreatorInputEnvelope = {
    data: UserCreateManyCreatorInput | UserCreateManyCreatorInput[]
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
    createdRoles?: RoleCreateNestedManyWithoutCreatorInput
    deletedRoles?: RoleCreateNestedManyWithoutDeleterInput
    updatedRoles?: RoleCreateNestedManyWithoutUpdaterInput
    creator?: UserCreateNestedOneWithoutCreatedUsersInput
    createdUsers?: UserCreateNestedManyWithoutCreatorInput
    deleter?: UserCreateNestedOneWithoutDeletedUsersInput
    role: RoleCreateNestedOneWithoutUsersInput
    updater?: UserCreateNestedOneWithoutUpdatedUsersInput
    updatedUsers?: UserCreateNestedManyWithoutUpdaterInput
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
    createdRoles?: RoleUncheckedCreateNestedManyWithoutCreatorInput
    deletedRoles?: RoleUncheckedCreateNestedManyWithoutDeleterInput
    updatedRoles?: RoleUncheckedCreateNestedManyWithoutUpdaterInput
    createdUsers?: UserUncheckedCreateNestedManyWithoutCreatorInput
    updatedUsers?: UserUncheckedCreateNestedManyWithoutUpdaterInput
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
    createdRoles?: RoleCreateNestedManyWithoutCreatorInput
    deletedRoles?: RoleCreateNestedManyWithoutDeleterInput
    updatedRoles?: RoleCreateNestedManyWithoutUpdaterInput
    creator?: UserCreateNestedOneWithoutCreatedUsersInput
    createdUsers?: UserCreateNestedManyWithoutCreatorInput
    deletedUsers?: UserCreateNestedManyWithoutDeleterInput
    role: RoleCreateNestedOneWithoutUsersInput
    updater?: UserCreateNestedOneWithoutUpdatedUsersInput
    updatedUsers?: UserCreateNestedManyWithoutUpdaterInput
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
    createdRoles?: RoleUncheckedCreateNestedManyWithoutCreatorInput
    deletedRoles?: RoleUncheckedCreateNestedManyWithoutDeleterInput
    updatedRoles?: RoleUncheckedCreateNestedManyWithoutUpdaterInput
    createdUsers?: UserUncheckedCreateNestedManyWithoutCreatorInput
    deletedUsers?: UserUncheckedCreateNestedManyWithoutDeleterInput
    updatedUsers?: UserUncheckedCreateNestedManyWithoutUpdaterInput
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
    deleter?: UserCreateNestedOneWithoutDeletedRolesInput
    updater?: UserCreateNestedOneWithoutUpdatedRolesInput
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
    createdRoles?: RoleCreateNestedManyWithoutCreatorInput
    deletedRoles?: RoleCreateNestedManyWithoutDeleterInput
    updatedRoles?: RoleCreateNestedManyWithoutUpdaterInput
    creator?: UserCreateNestedOneWithoutCreatedUsersInput
    createdUsers?: UserCreateNestedManyWithoutCreatorInput
    deleter?: UserCreateNestedOneWithoutDeletedUsersInput
    deletedUsers?: UserCreateNestedManyWithoutDeleterInput
    role: RoleCreateNestedOneWithoutUsersInput
    updater?: UserCreateNestedOneWithoutUpdatedUsersInput
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
    createdRoles?: RoleUncheckedCreateNestedManyWithoutCreatorInput
    deletedRoles?: RoleUncheckedCreateNestedManyWithoutDeleterInput
    updatedRoles?: RoleUncheckedCreateNestedManyWithoutUpdaterInput
    createdUsers?: UserUncheckedCreateNestedManyWithoutCreatorInput
    deletedUsers?: UserUncheckedCreateNestedManyWithoutDeleterInput
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
    createdRoles?: RoleCreateNestedManyWithoutCreatorInput
    deletedRoles?: RoleCreateNestedManyWithoutDeleterInput
    updatedRoles?: RoleCreateNestedManyWithoutUpdaterInput
    creator?: UserCreateNestedOneWithoutCreatedUsersInput
    createdUsers?: UserCreateNestedManyWithoutCreatorInput
    deleter?: UserCreateNestedOneWithoutDeletedUsersInput
    deletedUsers?: UserCreateNestedManyWithoutDeleterInput
    role: RoleCreateNestedOneWithoutUsersInput
    updatedUsers?: UserCreateNestedManyWithoutUpdaterInput
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
    createdRoles?: RoleUncheckedCreateNestedManyWithoutCreatorInput
    deletedRoles?: RoleUncheckedCreateNestedManyWithoutDeleterInput
    updatedRoles?: RoleUncheckedCreateNestedManyWithoutUpdaterInput
    createdUsers?: UserUncheckedCreateNestedManyWithoutCreatorInput
    deletedUsers?: UserUncheckedCreateNestedManyWithoutDeleterInput
    updatedUsers?: UserUncheckedCreateNestedManyWithoutUpdaterInput
  }

  export type UserCreateOrConnectWithoutUpdaterInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutUpdaterInput, UserUncheckedCreateWithoutUpdaterInput>
  }

  export type UserCreateManyUpdaterInputEnvelope = {
    data: UserCreateManyUpdaterInput | UserCreateManyUpdaterInput[]
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
    createdRoles?: RoleUpdateManyWithoutCreatorNestedInput
    deletedRoles?: RoleUpdateManyWithoutDeleterNestedInput
    updatedRoles?: RoleUpdateManyWithoutUpdaterNestedInput
    creator?: UserUpdateOneWithoutCreatedUsersNestedInput
    deleter?: UserUpdateOneWithoutDeletedUsersNestedInput
    deletedUsers?: UserUpdateManyWithoutDeleterNestedInput
    role?: RoleUpdateOneRequiredWithoutUsersNestedInput
    updater?: UserUpdateOneWithoutUpdatedUsersNestedInput
    updatedUsers?: UserUpdateManyWithoutUpdaterNestedInput
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
    createdRoles?: RoleUncheckedUpdateManyWithoutCreatorNestedInput
    deletedRoles?: RoleUncheckedUpdateManyWithoutDeleterNestedInput
    updatedRoles?: RoleUncheckedUpdateManyWithoutUpdaterNestedInput
    deletedUsers?: UserUncheckedUpdateManyWithoutDeleterNestedInput
    updatedUsers?: UserUncheckedUpdateManyWithoutUpdaterNestedInput
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
    createdRoles?: RoleUpdateManyWithoutCreatorNestedInput
    deletedRoles?: RoleUpdateManyWithoutDeleterNestedInput
    updatedRoles?: RoleUpdateManyWithoutUpdaterNestedInput
    creator?: UserUpdateOneWithoutCreatedUsersNestedInput
    createdUsers?: UserUpdateManyWithoutCreatorNestedInput
    deleter?: UserUpdateOneWithoutDeletedUsersNestedInput
    role?: RoleUpdateOneRequiredWithoutUsersNestedInput
    updater?: UserUpdateOneWithoutUpdatedUsersNestedInput
    updatedUsers?: UserUpdateManyWithoutUpdaterNestedInput
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
    createdRoles?: RoleUncheckedUpdateManyWithoutCreatorNestedInput
    deletedRoles?: RoleUncheckedUpdateManyWithoutDeleterNestedInput
    updatedRoles?: RoleUncheckedUpdateManyWithoutUpdaterNestedInput
    createdUsers?: UserUncheckedUpdateManyWithoutCreatorNestedInput
    updatedUsers?: UserUncheckedUpdateManyWithoutUpdaterNestedInput
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
    deleter?: UserUpdateOneWithoutDeletedRolesNestedInput
    updater?: UserUpdateOneWithoutUpdatedRolesNestedInput
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
    createdRoles?: RoleUpdateManyWithoutCreatorNestedInput
    deletedRoles?: RoleUpdateManyWithoutDeleterNestedInput
    updatedRoles?: RoleUpdateManyWithoutUpdaterNestedInput
    creator?: UserUpdateOneWithoutCreatedUsersNestedInput
    createdUsers?: UserUpdateManyWithoutCreatorNestedInput
    deleter?: UserUpdateOneWithoutDeletedUsersNestedInput
    deletedUsers?: UserUpdateManyWithoutDeleterNestedInput
    role?: RoleUpdateOneRequiredWithoutUsersNestedInput
    updater?: UserUpdateOneWithoutUpdatedUsersNestedInput
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
    createdRoles?: RoleUncheckedUpdateManyWithoutCreatorNestedInput
    deletedRoles?: RoleUncheckedUpdateManyWithoutDeleterNestedInput
    updatedRoles?: RoleUncheckedUpdateManyWithoutUpdaterNestedInput
    createdUsers?: UserUncheckedUpdateManyWithoutCreatorNestedInput
    deletedUsers?: UserUncheckedUpdateManyWithoutDeleterNestedInput
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

  export type ChartCreateWithoutChildrenInput = {
    chartId: string
    pilarId: number
    sbuId: number
    sbuSubId: number
    position: string
    capacity?: number
    orderIndex?: number
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    jobDesc?: string | null
    parent?: ChartCreateNestedOneWithoutChildrenInput
    members?: ChartMemberCreateNestedManyWithoutNodeInput
  }

  export type ChartUncheckedCreateWithoutChildrenInput = {
    chartId: string
    pilarId: number
    sbuId: number
    sbuSubId: number
    parentId?: string | null
    position: string
    capacity?: number
    orderIndex?: number
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    jobDesc?: string | null
    members?: ChartMemberUncheckedCreateNestedManyWithoutNodeInput
  }

  export type ChartCreateOrConnectWithoutChildrenInput = {
    where: ChartWhereUniqueInput
    create: XOR<ChartCreateWithoutChildrenInput, ChartUncheckedCreateWithoutChildrenInput>
  }

  export type ChartCreateWithoutParentInput = {
    chartId: string
    pilarId: number
    sbuId: number
    sbuSubId: number
    position: string
    capacity?: number
    orderIndex?: number
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    jobDesc?: string | null
    children?: ChartCreateNestedManyWithoutParentInput
    members?: ChartMemberCreateNestedManyWithoutNodeInput
  }

  export type ChartUncheckedCreateWithoutParentInput = {
    chartId: string
    pilarId: number
    sbuId: number
    sbuSubId: number
    position: string
    capacity?: number
    orderIndex?: number
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    jobDesc?: string | null
    children?: ChartUncheckedCreateNestedManyWithoutParentInput
    members?: ChartMemberUncheckedCreateNestedManyWithoutNodeInput
  }

  export type ChartCreateOrConnectWithoutParentInput = {
    where: ChartWhereUniqueInput
    create: XOR<ChartCreateWithoutParentInput, ChartUncheckedCreateWithoutParentInput>
  }

  export type ChartCreateManyParentInputEnvelope = {
    data: ChartCreateManyParentInput | ChartCreateManyParentInput[]
  }

  export type ChartMemberCreateWithoutNodeInput = {
    memberChartId: string
    userId?: number | null
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    jabatan?: string | null
  }

  export type ChartMemberUncheckedCreateWithoutNodeInput = {
    memberChartId: string
    userId?: number | null
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    jabatan?: string | null
  }

  export type ChartMemberCreateOrConnectWithoutNodeInput = {
    where: ChartMemberWhereUniqueInput
    create: XOR<ChartMemberCreateWithoutNodeInput, ChartMemberUncheckedCreateWithoutNodeInput>
  }

  export type ChartMemberCreateManyNodeInputEnvelope = {
    data: ChartMemberCreateManyNodeInput | ChartMemberCreateManyNodeInput[]
  }

  export type ChartUpsertWithoutChildrenInput = {
    update: XOR<ChartUpdateWithoutChildrenInput, ChartUncheckedUpdateWithoutChildrenInput>
    create: XOR<ChartCreateWithoutChildrenInput, ChartUncheckedCreateWithoutChildrenInput>
    where?: ChartWhereInput
  }

  export type ChartUpdateToOneWithWhereWithoutChildrenInput = {
    where?: ChartWhereInput
    data: XOR<ChartUpdateWithoutChildrenInput, ChartUncheckedUpdateWithoutChildrenInput>
  }

  export type ChartUpdateWithoutChildrenInput = {
    chartId?: StringFieldUpdateOperationsInput | string
    pilarId?: IntFieldUpdateOperationsInput | number
    sbuId?: IntFieldUpdateOperationsInput | number
    sbuSubId?: IntFieldUpdateOperationsInput | number
    position?: StringFieldUpdateOperationsInput | string
    capacity?: IntFieldUpdateOperationsInput | number
    orderIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    jobDesc?: NullableStringFieldUpdateOperationsInput | string | null
    parent?: ChartUpdateOneWithoutChildrenNestedInput
    members?: ChartMemberUpdateManyWithoutNodeNestedInput
  }

  export type ChartUncheckedUpdateWithoutChildrenInput = {
    chartId?: StringFieldUpdateOperationsInput | string
    pilarId?: IntFieldUpdateOperationsInput | number
    sbuId?: IntFieldUpdateOperationsInput | number
    sbuSubId?: IntFieldUpdateOperationsInput | number
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    capacity?: IntFieldUpdateOperationsInput | number
    orderIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    jobDesc?: NullableStringFieldUpdateOperationsInput | string | null
    members?: ChartMemberUncheckedUpdateManyWithoutNodeNestedInput
  }

  export type ChartUpsertWithWhereUniqueWithoutParentInput = {
    where: ChartWhereUniqueInput
    update: XOR<ChartUpdateWithoutParentInput, ChartUncheckedUpdateWithoutParentInput>
    create: XOR<ChartCreateWithoutParentInput, ChartUncheckedCreateWithoutParentInput>
  }

  export type ChartUpdateWithWhereUniqueWithoutParentInput = {
    where: ChartWhereUniqueInput
    data: XOR<ChartUpdateWithoutParentInput, ChartUncheckedUpdateWithoutParentInput>
  }

  export type ChartUpdateManyWithWhereWithoutParentInput = {
    where: ChartScalarWhereInput
    data: XOR<ChartUpdateManyMutationInput, ChartUncheckedUpdateManyWithoutParentInput>
  }

  export type ChartScalarWhereInput = {
    AND?: ChartScalarWhereInput | ChartScalarWhereInput[]
    OR?: ChartScalarWhereInput[]
    NOT?: ChartScalarWhereInput | ChartScalarWhereInput[]
    chartId?: StringFilter<"Chart"> | string
    pilarId?: IntFilter<"Chart"> | number
    sbuId?: IntFilter<"Chart"> | number
    sbuSubId?: IntFilter<"Chart"> | number
    parentId?: StringNullableFilter<"Chart"> | string | null
    position?: StringFilter<"Chart"> | string
    capacity?: IntFilter<"Chart"> | number
    orderIndex?: IntFilter<"Chart"> | number
    createdAt?: DateTimeFilter<"Chart"> | Date | string
    createdBy?: StringNullableFilter<"Chart"> | string | null
    updatedAt?: DateTimeFilter<"Chart"> | Date | string
    updatedBy?: StringNullableFilter<"Chart"> | string | null
    isDeleted?: BoolFilter<"Chart"> | boolean
    deletedAt?: DateTimeNullableFilter<"Chart"> | Date | string | null
    deletedBy?: StringNullableFilter<"Chart"> | string | null
    jobDesc?: StringNullableFilter<"Chart"> | string | null
  }

  export type ChartMemberUpsertWithWhereUniqueWithoutNodeInput = {
    where: ChartMemberWhereUniqueInput
    update: XOR<ChartMemberUpdateWithoutNodeInput, ChartMemberUncheckedUpdateWithoutNodeInput>
    create: XOR<ChartMemberCreateWithoutNodeInput, ChartMemberUncheckedCreateWithoutNodeInput>
  }

  export type ChartMemberUpdateWithWhereUniqueWithoutNodeInput = {
    where: ChartMemberWhereUniqueInput
    data: XOR<ChartMemberUpdateWithoutNodeInput, ChartMemberUncheckedUpdateWithoutNodeInput>
  }

  export type ChartMemberUpdateManyWithWhereWithoutNodeInput = {
    where: ChartMemberScalarWhereInput
    data: XOR<ChartMemberUpdateManyMutationInput, ChartMemberUncheckedUpdateManyWithoutNodeInput>
  }

  export type ChartMemberScalarWhereInput = {
    AND?: ChartMemberScalarWhereInput | ChartMemberScalarWhereInput[]
    OR?: ChartMemberScalarWhereInput[]
    NOT?: ChartMemberScalarWhereInput | ChartMemberScalarWhereInput[]
    memberChartId?: StringFilter<"ChartMember"> | string
    chartId?: StringFilter<"ChartMember"> | string
    userId?: IntNullableFilter<"ChartMember"> | number | null
    createdAt?: DateTimeFilter<"ChartMember"> | Date | string
    createdBy?: StringNullableFilter<"ChartMember"> | string | null
    updatedAt?: DateTimeFilter<"ChartMember"> | Date | string
    updatedBy?: StringNullableFilter<"ChartMember"> | string | null
    isDeleted?: BoolFilter<"ChartMember"> | boolean
    deletedAt?: DateTimeNullableFilter<"ChartMember"> | Date | string | null
    deletedBy?: StringNullableFilter<"ChartMember"> | string | null
    jabatan?: StringNullableFilter<"ChartMember"> | string | null
  }

  export type ChartCreateWithoutMembersInput = {
    chartId: string
    pilarId: number
    sbuId: number
    sbuSubId: number
    position: string
    capacity?: number
    orderIndex?: number
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    jobDesc?: string | null
    parent?: ChartCreateNestedOneWithoutChildrenInput
    children?: ChartCreateNestedManyWithoutParentInput
  }

  export type ChartUncheckedCreateWithoutMembersInput = {
    chartId: string
    pilarId: number
    sbuId: number
    sbuSubId: number
    parentId?: string | null
    position: string
    capacity?: number
    orderIndex?: number
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    jobDesc?: string | null
    children?: ChartUncheckedCreateNestedManyWithoutParentInput
  }

  export type ChartCreateOrConnectWithoutMembersInput = {
    where: ChartWhereUniqueInput
    create: XOR<ChartCreateWithoutMembersInput, ChartUncheckedCreateWithoutMembersInput>
  }

  export type ChartUpsertWithoutMembersInput = {
    update: XOR<ChartUpdateWithoutMembersInput, ChartUncheckedUpdateWithoutMembersInput>
    create: XOR<ChartCreateWithoutMembersInput, ChartUncheckedCreateWithoutMembersInput>
    where?: ChartWhereInput
  }

  export type ChartUpdateToOneWithWhereWithoutMembersInput = {
    where?: ChartWhereInput
    data: XOR<ChartUpdateWithoutMembersInput, ChartUncheckedUpdateWithoutMembersInput>
  }

  export type ChartUpdateWithoutMembersInput = {
    chartId?: StringFieldUpdateOperationsInput | string
    pilarId?: IntFieldUpdateOperationsInput | number
    sbuId?: IntFieldUpdateOperationsInput | number
    sbuSubId?: IntFieldUpdateOperationsInput | number
    position?: StringFieldUpdateOperationsInput | string
    capacity?: IntFieldUpdateOperationsInput | number
    orderIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    jobDesc?: NullableStringFieldUpdateOperationsInput | string | null
    parent?: ChartUpdateOneWithoutChildrenNestedInput
    children?: ChartUpdateManyWithoutParentNestedInput
  }

  export type ChartUncheckedUpdateWithoutMembersInput = {
    chartId?: StringFieldUpdateOperationsInput | string
    pilarId?: IntFieldUpdateOperationsInput | number
    sbuId?: IntFieldUpdateOperationsInput | number
    sbuSubId?: IntFieldUpdateOperationsInput | number
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    capacity?: IntFieldUpdateOperationsInput | number
    orderIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    jobDesc?: NullableStringFieldUpdateOperationsInput | string | null
    children?: ChartUncheckedUpdateManyWithoutParentNestedInput
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
    createdRoles?: RoleUpdateManyWithoutCreatorNestedInput
    deletedRoles?: RoleUpdateManyWithoutDeleterNestedInput
    updatedRoles?: RoleUpdateManyWithoutUpdaterNestedInput
    creator?: UserUpdateOneWithoutCreatedUsersNestedInput
    createdUsers?: UserUpdateManyWithoutCreatorNestedInput
    deleter?: UserUpdateOneWithoutDeletedUsersNestedInput
    deletedUsers?: UserUpdateManyWithoutDeleterNestedInput
    updater?: UserUpdateOneWithoutUpdatedUsersNestedInput
    updatedUsers?: UserUpdateManyWithoutUpdaterNestedInput
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
    createdRoles?: RoleUncheckedUpdateManyWithoutCreatorNestedInput
    deletedRoles?: RoleUncheckedUpdateManyWithoutDeleterNestedInput
    updatedRoles?: RoleUncheckedUpdateManyWithoutUpdaterNestedInput
    createdUsers?: UserUncheckedUpdateManyWithoutCreatorNestedInput
    deletedUsers?: UserUncheckedUpdateManyWithoutDeleterNestedInput
    updatedUsers?: UserUncheckedUpdateManyWithoutUpdaterNestedInput
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
    deleter?: UserUpdateOneWithoutDeletedRolesNestedInput
    updater?: UserUpdateOneWithoutUpdatedRolesNestedInput
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
    createdRoles?: RoleUpdateManyWithoutCreatorNestedInput
    deletedRoles?: RoleUpdateManyWithoutDeleterNestedInput
    updatedRoles?: RoleUpdateManyWithoutUpdaterNestedInput
    createdUsers?: UserUpdateManyWithoutCreatorNestedInput
    deleter?: UserUpdateOneWithoutDeletedUsersNestedInput
    deletedUsers?: UserUpdateManyWithoutDeleterNestedInput
    role?: RoleUpdateOneRequiredWithoutUsersNestedInput
    updater?: UserUpdateOneWithoutUpdatedUsersNestedInput
    updatedUsers?: UserUpdateManyWithoutUpdaterNestedInput
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
    createdRoles?: RoleUncheckedUpdateManyWithoutCreatorNestedInput
    deletedRoles?: RoleUncheckedUpdateManyWithoutDeleterNestedInput
    updatedRoles?: RoleUncheckedUpdateManyWithoutUpdaterNestedInput
    createdUsers?: UserUncheckedUpdateManyWithoutCreatorNestedInput
    deletedUsers?: UserUncheckedUpdateManyWithoutDeleterNestedInput
    updatedUsers?: UserUncheckedUpdateManyWithoutUpdaterNestedInput
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
    createdRoles?: RoleUpdateManyWithoutCreatorNestedInput
    deletedRoles?: RoleUpdateManyWithoutDeleterNestedInput
    updatedRoles?: RoleUpdateManyWithoutUpdaterNestedInput
    creator?: UserUpdateOneWithoutCreatedUsersNestedInput
    createdUsers?: UserUpdateManyWithoutCreatorNestedInput
    deletedUsers?: UserUpdateManyWithoutDeleterNestedInput
    role?: RoleUpdateOneRequiredWithoutUsersNestedInput
    updater?: UserUpdateOneWithoutUpdatedUsersNestedInput
    updatedUsers?: UserUpdateManyWithoutUpdaterNestedInput
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
    createdRoles?: RoleUncheckedUpdateManyWithoutCreatorNestedInput
    deletedRoles?: RoleUncheckedUpdateManyWithoutDeleterNestedInput
    updatedRoles?: RoleUncheckedUpdateManyWithoutUpdaterNestedInput
    createdUsers?: UserUncheckedUpdateManyWithoutCreatorNestedInput
    deletedUsers?: UserUncheckedUpdateManyWithoutDeleterNestedInput
    updatedUsers?: UserUncheckedUpdateManyWithoutUpdaterNestedInput
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
    createdRoles?: RoleUpdateManyWithoutCreatorNestedInput
    deletedRoles?: RoleUpdateManyWithoutDeleterNestedInput
    updatedRoles?: RoleUpdateManyWithoutUpdaterNestedInput
    creator?: UserUpdateOneWithoutCreatedUsersNestedInput
    createdUsers?: UserUpdateManyWithoutCreatorNestedInput
    deleter?: UserUpdateOneWithoutDeletedUsersNestedInput
    deletedUsers?: UserUpdateManyWithoutDeleterNestedInput
    role?: RoleUpdateOneRequiredWithoutUsersNestedInput
    updatedUsers?: UserUpdateManyWithoutUpdaterNestedInput
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
    createdRoles?: RoleUncheckedUpdateManyWithoutCreatorNestedInput
    deletedRoles?: RoleUncheckedUpdateManyWithoutDeleterNestedInput
    updatedRoles?: RoleUncheckedUpdateManyWithoutUpdaterNestedInput
    createdUsers?: UserUncheckedUpdateManyWithoutCreatorNestedInput
    deletedUsers?: UserUncheckedUpdateManyWithoutDeleterNestedInput
    updatedUsers?: UserUncheckedUpdateManyWithoutUpdaterNestedInput
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

  export type ChartCreateManyParentInput = {
    chartId: string
    pilarId: number
    sbuId: number
    sbuSubId: number
    position: string
    capacity?: number
    orderIndex?: number
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    jobDesc?: string | null
  }

  export type ChartMemberCreateManyNodeInput = {
    memberChartId: string
    userId?: number | null
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    isDeleted?: boolean
    deletedAt?: Date | string | null
    deletedBy?: string | null
    jabatan?: string | null
  }

  export type ChartUpdateWithoutParentInput = {
    chartId?: StringFieldUpdateOperationsInput | string
    pilarId?: IntFieldUpdateOperationsInput | number
    sbuId?: IntFieldUpdateOperationsInput | number
    sbuSubId?: IntFieldUpdateOperationsInput | number
    position?: StringFieldUpdateOperationsInput | string
    capacity?: IntFieldUpdateOperationsInput | number
    orderIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    jobDesc?: NullableStringFieldUpdateOperationsInput | string | null
    children?: ChartUpdateManyWithoutParentNestedInput
    members?: ChartMemberUpdateManyWithoutNodeNestedInput
  }

  export type ChartUncheckedUpdateWithoutParentInput = {
    chartId?: StringFieldUpdateOperationsInput | string
    pilarId?: IntFieldUpdateOperationsInput | number
    sbuId?: IntFieldUpdateOperationsInput | number
    sbuSubId?: IntFieldUpdateOperationsInput | number
    position?: StringFieldUpdateOperationsInput | string
    capacity?: IntFieldUpdateOperationsInput | number
    orderIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    jobDesc?: NullableStringFieldUpdateOperationsInput | string | null
    children?: ChartUncheckedUpdateManyWithoutParentNestedInput
    members?: ChartMemberUncheckedUpdateManyWithoutNodeNestedInput
  }

  export type ChartUncheckedUpdateManyWithoutParentInput = {
    chartId?: StringFieldUpdateOperationsInput | string
    pilarId?: IntFieldUpdateOperationsInput | number
    sbuId?: IntFieldUpdateOperationsInput | number
    sbuSubId?: IntFieldUpdateOperationsInput | number
    position?: StringFieldUpdateOperationsInput | string
    capacity?: IntFieldUpdateOperationsInput | number
    orderIndex?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    jobDesc?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ChartMemberUpdateWithoutNodeInput = {
    memberChartId?: StringFieldUpdateOperationsInput | string
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    jabatan?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ChartMemberUncheckedUpdateWithoutNodeInput = {
    memberChartId?: StringFieldUpdateOperationsInput | string
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    jabatan?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ChartMemberUncheckedUpdateManyWithoutNodeInput = {
    memberChartId?: StringFieldUpdateOperationsInput | string
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null
    jabatan?: NullableStringFieldUpdateOperationsInput | string | null
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