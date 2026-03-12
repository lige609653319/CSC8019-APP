import React, { useState } from 'react';
import { Form, Input, Button, Toast, Image, Space } from 'antd-mobile';
import { useNavigate, Link } from 'react-router-dom';
import request from '../utils/request';
import '../App.css';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await request.post('/auth/login', values);
      // Based on response format: { code: 200, message: "...", data: { token: "...", tokenHead: "..." } }
      if (response && response.code === 200 && response.data) {
        const { token, tokenHead } = response.data;
        // Join tokenHead and token with a space if tokenHead doesn't already end with one
        const authHeader = tokenHead.endsWith(' ') ? `${tokenHead}${token}` : `${tokenHead} ${token}`;
        localStorage.setItem('token', authHeader);
        Toast.show({
          icon: 'success',
          content: 'Login successful',
        });
        navigate('/');
      } else {
        Toast.show({
          icon: 'fail',
          content: response.message || 'Login failed',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      Toast.show({
        icon: 'fail',
        content: error.message || 'Login error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ 
      padding: '40px 20px', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Space direction="vertical" align="center">
          <Image 
            src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=150&q=80" 
            width={80} 
            height={80} 
            style={{ borderRadius: 40, border: '3px solid #6F4E37' }}
          />
          <h1 style={{ color: '#6F4E37', margin: '10px 0 0 0' }}>Coffee Shop</h1>
          <p style={{ color: '#666', margin: 0 }}>Welcome back! Please login.</p>
        </Space>
      </div>

      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Form
          layout="vertical"
          onFinish={onFinish}
          footer={
            <div style={{ marginTop: 10 }}>
              <Button block type="submit" color="primary" size="large" loading={loading} style={{ backgroundColor: '#6F4E37', border: 'none' }}>
                Login
              </Button>
              <div style={{ textAlign: 'center', marginTop: 15 }}>
                <span style={{ color: '#999', fontSize: 14 }}>Don't have an account? </span>
                <Link to="/register" style={{ color: '#6F4E37', fontSize: 14, fontWeight: 'bold', textDecoration: 'none' }}>Register</Link>
              </div>
            </div>
          }
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please input your username' }]}
          >
            <Input placeholder="Enter username" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please input your password' }]}
          >
            <Input type="password" placeholder="Enter password" />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
