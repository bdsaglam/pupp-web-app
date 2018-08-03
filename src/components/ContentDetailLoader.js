import React from "react";
import ContentLoader from 'react-content-loader';

const ContentDetailLoader = () => (
    <div className="ContentDetailLoader">
        <ContentLoader
            height={600}
            width={800}
        >
            <rect x="0" y="10" rx="5" ry="5" width="800" height="420" />

            <rect x="0" y="440" rx="5" ry="5" width="250" height="20" />
            <rect x="260" y="440" rx="5" ry="5" width="80" height="20" />
            <rect x="350" y="440" rx="5" ry="5" width="80" height="20" />
            <rect x="440" y="440" rx="5" ry="5" width="80" height="20" />
            <rect x="530" y="440" rx="5" ry="5" width="80" height="20" />
            <rect x="620" y="440" rx="5" ry="5" width="80" height="20" />
            <rect x="710" y="440" rx="5" ry="5" width="80" height="20" />
        </ContentLoader>
    </div>
);

export default ContentDetailLoader;