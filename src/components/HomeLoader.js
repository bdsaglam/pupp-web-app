import React from "react";
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import ContentLoader from 'react-content-loader';

const HomeLoader = () => (
    <div className="HomeLoader">
        <Row>
            <Col xs={12} md={6}>
                <ContentLoader height={400} width={500} >
                    <rect x="0" y="0" rx="5" ry="5" width="480" height="270" />
                    <rect x="0" y="300" rx="5" ry="5" width="480" height="20" />
                    <rect x="0" y="340" rx="5" ry="5" width="480" height="20" />
                </ContentLoader>
            </Col>
            <Col xs={12} md={6}>
                <ContentLoader height={600} width={500} >
                    <rect x="0" y="0" rx="5" ry="5" width="500" height="40" />

                    <rect x="0" y="80" rx="5" ry="5" width="160" height="120" />
                    <rect x="180" y="80" rx="5" ry="5" width="320" height="20" />
                    <rect x="180" y="120" rx="5" ry="5" width="320" height="20" />

                    <rect x="0" y="240" rx="5" ry="5" width="160" height="120" />
                    <rect x="180" y="240" rx="5" ry="5" width="320" height="20" />
                    <rect x="180" y="280" rx="5" ry="5" width="320" height="20" />

                    <rect x="0" y="400" rx="5" ry="5" width="160" height="120" />
                    <rect x="180" y="400" rx="5" ry="5" width="320" height="20" />
                    <rect x="180" y="440" rx="5" ry="5" width="320" height="20" />
                </ContentLoader>
            </Col>
        </Row>
    </div>
);

export default HomeLoader;