import React from "react";
import { tweakClasses } from "../utils/tailwindTweaks";

const TweakWrapper = ({ children }) => {
  const tweakChild = (child) => {
    if (!React.isValidElement(child)) return child;

    const newProps = { ...child.props };

    if (child.props.className) {
      newProps.className = tweakClasses(child.props.className);
    }

    if (child.props.children) {
      newProps.children = React.Children.map(child.props.children, tweakChild);
    }

    // return React.cloneElement(child, newProps);
  };

  // return <>{React.Children.map(children, tweakChild)}</>;
  return children;
};

export default TweakWrapper;
