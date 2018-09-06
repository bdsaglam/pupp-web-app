import stack from "./stack";

const dev = {
    Auth: {
        region: stack.Region,
        userPoolId: stack.UserPoolId,
        identityPoolId: stack.IdentityPoolId,
        userPoolWebClientId: stack.UserPoolClientId,
        mandatorySignIn: false,
    },
    API: {
        endpoints: [
            {
                name: "MainAPI",
                endpoint: stack.ServiceEndpoint,
                region: stack.Region
            },
            {
                name: "ContactAPI",
                endpoint: "https://1g6f9uqi0b.execute-api.eu-west-1.amazonaws.com/dev",
                region: "eu-west-1"
            }
        ]
    }
};

const production = dev;

// Default to dev if not set
const config = process.env.REACT_APP_STAGE === 'production'
    ? production
    : dev;

export default config;
