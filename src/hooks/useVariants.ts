import { useState } from 'react';
import { message } from 'antd';
import { productsApi } from '../api/products';

export const useVariants = () => {
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState([]);

  const getVariants = async (productId: number) => {
    setLoading(true);
    try {
      const response = await productsApi.getVariants(productId);
      setVariants(response);
      return response;
    } catch (error) {
      console.error('Error fetching variants:', error);
      message.error('Có lỗi xảy ra khi tải variants!');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getVariant = async (productId: number, variantId: number) => {
    setLoading(true);
    try {
      const response = await productsApi.getVariant(productId, variantId);
      return response;
    } catch (error) {
      console.error('Error fetching variant:', error);
      message.error('Có lỗi xảy ra khi tải variant!');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createVariant = async (productId: number, variantData: any) => {
    setLoading(true);
    try {
      const response = await productsApi.createVariant(productId, variantData);
      message.success('Tạo variant thành công!');
      return response;
    } catch (error) {
      console.error('Error creating variant:', error);
      message.error('Có lỗi xảy ra khi tạo variant!');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateVariant = async (productId: number, variantId: number, variantData: any) => {
    setLoading(true);
    try {
      const response = await productsApi.updateVariant(productId, variantId, variantData);
      message.success('Cập nhật variant thành công!');
      return response;
    } catch (error) {
      console.error('Error updating variant:', error);
      message.error('Có lỗi xảy ra khi cập nhật variant!');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteVariant = async (productId: number, variantId: number) => {
    setLoading(true);
    try {
      const response = await productsApi.deleteVariant(productId, variantId);
      message.success('Xóa variant thành công!');
      return response;
    } catch (error) {
      console.error('Error deleting variant:', error);
      message.error('Có lỗi xảy ra khi xóa variant!');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const setVariantPrice = async (productId: number, variantId: number, priceData: any) => {
    setLoading(true);
    try {
      const response = await productsApi.setVariantPrice(productId, variantId, priceData);
      message.success('Đặt giá variant thành công!');
      return response;
    } catch (error) {
      console.error('Error setting variant price:', error);
      message.error('Có lỗi xảy ra khi đặt giá variant!');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateVariantPrice = async (productId: number, variantId: number, priceId: number, priceData: any) => {
    setLoading(true);
    try {
      const response = await productsApi.updateVariantPrice(productId, variantId, priceId, priceData);
      message.success('Cập nhật giá variant thành công!');
      return response;
    } catch (error) {
      console.error('Error updating variant price:', error);
      message.error('Có lỗi xảy ra khi cập nhật giá variant!');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getVariantPrices = async (productId: number, variantId: number) => {
    setLoading(true);
    try {
      const response = await productsApi.getVariantPrices(productId, variantId);
      return response;
    } catch (error) {
      console.error('Error fetching variant prices:', error);
      message.error('Có lỗi xảy ra khi tải giá variant!');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const deleteVariantPrice = async (productId: number, variantId: number, priceId: number) => {
    setLoading(true);
    try {
      const response = await productsApi.deleteVariantPrice(productId, variantId, priceId);
      message.success('Xóa giá thành công!');
      return response;
    } catch (error) {
      console.error('Error deleting variant price:', error);
      message.error('Có lỗi xảy ra khi xóa giá!');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cleanupVariants = async (productId: number) => {
    setLoading(true);
    try {
      const response = await productsApi.cleanupVariants(productId);
      message.success('Cleanup variants thành công!');
      return response;
    } catch (error) {
      console.error('Error cleaning up variants:', error);
      message.error('Có lỗi xảy ra khi cleanup variants!');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const debugProduct = async (productId: number) => {
    setLoading(true);
    try {
      const response = await productsApi.debugProduct(productId);
      return response;
    } catch (error) {
      console.error('Error debugging product:', error);
      message.error('Có lỗi xảy ra khi debug product!');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    variants,
    setVariants,
    getVariants,
    getVariant,
    createVariant,
    updateVariant,
    deleteVariant,
    setVariantPrice,
    updateVariantPrice,
    getVariantPrices,
    deleteVariantPrice,
    cleanupVariants,
    debugProduct,
  };
};

export default useVariants;
