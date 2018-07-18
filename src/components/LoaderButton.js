import React from "react";
import Button from 'react-bootstrap/lib/Button';
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faSync from "@fortawesome/fontawesome-free-solid/faSync";
import "./LoaderButton.css";

export default ({
  isLoading,
  text,
  loadingText,
  className = "",
  disabled = false,
  ...props
}) =>
  <Button
    className={`LoaderButton ${className}`}
    disabled={disabled || isLoading}
    {...props}
  >
    {isLoading && <FontAwesomeIcon icon={faSync} size='1x' spin className="loading-icon"/>}
    {!isLoading ? text : loadingText}
  </Button>;
