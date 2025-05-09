import React, { useState } from 'react';
import { useWeb3Modal } from '@web3modal/react';
import { useAccount } from 'wagmi';
import { Button, Form, Input, message } from 'antd';
import api from '../utils/api';
import blockchainService from '../services/blockchain';
import './Auth.css';

const Auth = () => {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleConnectWallet = async () => {
    try {
      setLoading(true);
      // 使用blockchain服务连接钱包，确保每次都会唤起钱包选择界面
      // 现在blockchain服务会直接抛出具体错误，不再返回布尔值
      await blockchainService.connectWallet();
      message.success('钱包连接成功');
    } catch (error) {
      // 显示具体的错误信息，而不是通用错误
      message.error(error.message || '钱包连接失败');
      console.error('连接钱包失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const response = await api.userApi.saveUser({
        walletAddress: address,
        username: values.username,
        email: values.email
      });
      if (response.status === 200 && response.data?.success) {
        message.success('注册成功');
      } else {
        message.error(response.data?.message || '注册失败');
      }
      form.resetFields();
    } catch (error) {
      message.error(error.response?.data?.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {!isConnected ? (
        <Button 
          type="primary" 
          onClick={handleConnectWallet}
          loading={loading}
        >
          连接钱包
        </Button>
      ) : (
        <>
          <div className="mb-4 p-3 bg-white rounded shadow w-full max-w-md">
            <p>已连接钱包: {address}</p>
          </div>
          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { 
                  required: true, 
                  message: '请输入邮箱' 
                },
                { 
                  type: 'email', 
                  message: '请输入有效的邮箱地址' 
                }
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={loading}
              >
                注册
              </Button>
            </Form.Item>
          </Form>
        </>
      )}
    </div>
  );
};

export default Auth;