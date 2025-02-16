import React from 'react';
import { Layout, Menu, theme } from 'antd';
import { CodeOutlined } from '@ant-design/icons';
import './App.css';
import JsonFormatter from './components/JsonFormatter';

const { Header, Content, Footer, Sider } = Layout;

function App() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
      >
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={[
            { key: '1', icon: <CodeOutlined />, label: 'JSON 格式化' },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
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
    </Layout>
  );
}

export default App;
