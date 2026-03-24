import { useEffect } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { API_URL } from "../../utils/constants";
import useStore from "../../store/useStore";
import { orderKeys } from "../../hooks/useOrderQuery";
import { getAccessToken } from "../../lib/api";

type OrderEventPayload = {
  id?: number;
  orderId?: number;
};

const invalidateOrderQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  payload: OrderEventPayload,
) => {
  const orderId = payload.id || payload.orderId;

  queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

  if (orderId) {
    queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
    queryClient.invalidateQueries({ queryKey: orderKeys.history(orderId) });
    queryClient.invalidateQueries({ queryKey: orderKeys.payments(orderId) });
  }
};

const OrderRealtimeSync = () => {
  const queryClient = useQueryClient();
  const token = useStore((state) => state.token);

  useEffect(() => {
    const accessToken = getAccessToken() || token;
    if (!accessToken) {
      return;
    }

    const socket = io(API_URL, {
      auth: { token: accessToken },
      transports: ["websocket"],
      withCredentials: true,
      reconnection: true,
    });

    const handleEvent = (payload: OrderEventPayload) => {
      invalidateOrderQueries(queryClient, payload);
    };

    socket.on("order.created", handleEvent);
    socket.on("order.status.changed", handleEvent);
    socket.on("order.note.updated", handleEvent);
    socket.on("order.canceled", handleEvent);
    socket.on("order.payment.changed", handleEvent);

    return () => {
      socket.off("order.created", handleEvent);
      socket.off("order.status.changed", handleEvent);
      socket.off("order.note.updated", handleEvent);
      socket.off("order.canceled", handleEvent);
      socket.off("order.payment.changed", handleEvent);
      socket.disconnect();
    };
  }, [queryClient, token]);

  return null;
};

export default OrderRealtimeSync;
