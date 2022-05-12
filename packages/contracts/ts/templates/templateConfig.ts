import { ConfigFieldTypeToPrimitiveType, StoreConfig } from "@latticexyz/store";

export type TemplateConfig<C extends StoreConfig> = {
  [Table in keyof C["tables"]]?: {
    [Field in keyof C["tables"][Table]["valueSchema"]]: ConfigFieldTypeToPrimitiveType<
      C["tables"][Table]["valueSchema"][Field]
    >;
  };
};

export type TemplatesConfig<C extends StoreConfig> = Record<string, TemplateConfig<C>>;
