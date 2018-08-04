import React from "react";
import ContentLoader from 'react-content-loader';

const ContentDetailLoader = () => (
    <div className="ContentDetailLoader">
        <ContentLoader
            height={400}
            width={720}
        >
            <rect x="40" y="0" rx="5" ry="5" width="640" height="360" />

            <rect x="40" y="370" rx="5" ry="5" width="240" height="20" />
            <rect x="300" y="370" rx="5" ry="5" width="80" height="20" />
            <rect x="400" y="370" rx="5" ry="5" width="80" height="20" />
            <rect x="500" y="370" rx="5" ry="5" width="80" height="20" />
            <rect x="600" y="370" rx="5" ry="5" width="80" height="20" />
        </ContentLoader>
    </div>
);

export default ContentDetailLoader;