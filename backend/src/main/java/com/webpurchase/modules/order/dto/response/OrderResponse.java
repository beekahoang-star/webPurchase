package com.webpurchase.modules.order.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse implements Serializable {

    private Long id;
    private String orderCode;
    private Long userId;
    private BigDecimal totalAmount;
    private String status;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String shippingAddress;
    private String paymentMethod;
    private String paymentStatus;
    private String notes;
    private Instant createdAt;

    @Builder.Default
    private List<OrderItemResponse> items = new ArrayList<>();
}
