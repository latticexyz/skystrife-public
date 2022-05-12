import { useComponentValue } from "@latticexyz/react";
import { Layers, removeComponent } from "@latticexyz/recs";
import { Component, Entity, Schema, Metadata } from "@latticexyz/recs/src/types";
import { ComponentBrowserButton, ComponentEditorContainer, ComponentTitle } from "./StyledComponents";
import { ComponentValueEditor } from "./ComponentValueEditor";
import { hasContract, SetContractComponentFunction } from "./types";

export const ComponentEditor = ({
  entity,
  component,
  layers,
  setContractComponentValue,
}: {
  entity: Entity;
  component: Component<Schema, Metadata, undefined>;
  layers: Layers;
  setContractComponentValue?: SetContractComponentFunction<Schema>;
}) => {
  const value = useComponentValue(component, entity);
  if (!value) return null;

  return (
    <ComponentEditorContainer>
      <ComponentTitle>
        {(component.metadata?.componentName as string) ?? component.id}
        <ComponentBrowserButton
          onClick={() => {
            removeComponent(component, entity);

            if (setContractComponentValue && hasContract(component)) setContractComponentValue(entity, component, {});
          }}
        >
          Remove
        </ComponentBrowserButton>
      </ComponentTitle>
      <ComponentValueEditor
        entity={entity}
        component={component}
        componentValue={value}
        layers={layers}
        setContractComponentValue={setContractComponentValue}
      />
    </ComponentEditorContainer>
  );
};
