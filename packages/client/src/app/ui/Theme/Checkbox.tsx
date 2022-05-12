import styled from "styled-components";
import { twMerge } from "tailwind-merge";

const CheckboxContainer = styled.div`
  display: inline-block;
  vertical-align: middle;
`;

const Icon = styled.svg`
  fill: none;
  stroke: white;
  strokewidth: 2px;
`;

const HiddenCheckbox = styled.input.attrs({ type: "checkbox" })`
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;

const StyledCheckbox = styled.div<{ checked: boolean }>`
  display: inline-block;
  width: 24px;
  height: 24px;
  transition: all 150ms;
  border: ${(props) => (!props.checked ? "none" : "2px solid white")};

  ${Icon} {
    visibility: ${(props) => (props.checked ? "visible" : "hidden")};
  }
`;

type Props = {
  className?: string;
  checked: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  style?: React.CSSProperties;
};

export const Checkbox = ({ onChange, className, checked, style, ...props }: Props) => (
  <CheckboxContainer className={twMerge("rounded-lg", className)}>
    <HiddenCheckbox checked={checked} readOnly={!onChange} {...props} />
    <StyledCheckbox
      checked={checked}
      className={twMerge(className, "rounded-lg", checked ? "bg-lime-600" : "bg-white")}
      style={{ transition: "all 150ms", ...style }}
    >
      <Icon viewBox="0 0 24 24">
        <polyline points="20 6 9 17 4 12" />
      </Icon>
    </StyledCheckbox>
  </CheckboxContainer>
);
