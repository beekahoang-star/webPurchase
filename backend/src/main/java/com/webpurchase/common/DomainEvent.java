package com.webpurchase.common;

import java.time.Instant;

public interface DomainEvent {

    Instant occurredOn();

    String eventType();
}
