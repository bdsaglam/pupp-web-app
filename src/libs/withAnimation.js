import React, { Component } from "react";

// This function takes a component...
function withAnimation(WrappedComponent) {
    // ...and returns another component...
    let C = (
        class extends Component {
            constructor(props) {
                super(props);
                this.startAnimation = this.startAnimation.bind(this);
                this.stopAnimation = this.stopAnimation.bind(this);
                this.state = {
                    animate: this.props.animateOnMount,
                };
            }

            startAnimation() {
                this.setState({
                    animate: true,
                });
            }

            stopAnimation() {
                this.setState({
                    animate: false,
                });
            }

            render() {
                // ... and renders the wrapped component with the fresh data!
                // Notice that we pass through any additional props
                let { className, ...rest } = this.props;
                className = className || "";
                if (this.state.animate) {
                    className = className + " Animate";
                }

                return <WrappedComponent className={className} {...rest} />;
            }
        }
    );

    C.defaultProps = {
        animateOnMount: false,
    };

    return C;
}

export default withAnimation;