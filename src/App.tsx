import React from 'react';
import { Layout, theme } from 'antd';
import './App.css';
import JsonFormatter from './components/JsonFormatter';

const { Content, Footer } = Layout;

function App() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ margin: '24px 16px 0' }}>
        <div
          style={{
            minHeight: 360,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <JsonFormatter />
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        ©{new Date().getFullYear()} Created with React + Ant Design
      </Footer>
    </Layout>
  );
}

export default App;
