package com.webpurchase.modules.order.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse implements Serializable {

    private Long id;
    private Long skuId;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;

    /**
     * Preserved historical variant snapshot from the moment of purchase.
     */
    private Map<String, Object> variantSnapshot;
}
