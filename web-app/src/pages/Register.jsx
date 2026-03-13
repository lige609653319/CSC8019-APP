import React, { useState } from 'react';
import { Form, Input, Button, Toast, Image, Space } from 'antd-mobile';
import { useNavigate, Link } from 'react-router-dom';
import request from '../utils/request';
import '../App.css';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Endpoint as per user request (with typo 'registe')
      const response = await request.post('/auth/register', values);

      // Assuming successful registration returns 200 code
      if (response && response.code === 200) {
        Toast.show({
          icon: 'success',
          content: 'Registration successful! Please login.',
        });
        navigate('/login');
      } else {
        Toast.show({
          icon: 'fail',
          content: response.message || 'Registration failed',
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Global errorHandler in request.js will handle the Toast message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{
      padding: '40px 20px',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <Space direction="vertical" align="center">
          <Image
            src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=150&q=80"
            width={70}
            height={70}
            style={{ borderRadius: 35, border: '3px solid #6F4E37' }}
          />
          <h1 style={{ color: '#6F4E37', margin: '10px 0 0 0' }}>Join Us</h1>
          <p style={{ color: '#666', margin: 0 }}>Create your account</p>
        </Space>
      </div>

      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Form
          layout="vertical"
          onFinish={onFinish}
          footer={
            <div style={{ marginTop: 10 }}>
              <Button block type="submit" color="primary" size="large" loading={loading} style={{ backgroundColor: '#6F4E37', border: 'none' }}>
                Register
              </Button>
              <div style={{ textAlign: 'center', marginTop: 15 }}>
                <span style={{ color: '#999', fontSize: 14 }}>Already have an account? </span>
                <Link to="/login" style={{ color: '#6F4E37', fontSize: 14, fontWeight: 'bold', textDecoration: 'none' }}>Login</Link>
              </div>
            </div>
          }
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: 'Username cannot be empty' },
              { min: 3, max: 50, message: 'Username must be between 3 and 50 characters' }
            ]}
          >
            <Input placeholder="3-50 characters" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email cannot be empty' },
              { type: 'email', message: 'Invalid email format' }
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Password cannot be empty' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input type="password" placeholder="Min 6 characters" />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Register;
