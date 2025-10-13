package com.example.gestor_inversores.model.enums;

public enum InvestmentStatus {

    IN_PROGRESS,      // La inversión ha sido creada, pendiente de transferencia
    RECEIVED,         // El estudiante ha confirmado la recepción del dinero
    NOT_RECEIVED,     // El estudiante ha reportado que no recibió el dinero
    CANCELLED,        // La inversión ha sido cancelada
    PENDING_RETURN,   // El estudiante ha iniciado la devolución, pendiente de confirmación del inversor
    RETURNED,         // El inversor ha confirmado la recepción de la devolución
    COMPLETED         // La inversión completó su ciclo y la ganancia fue pagada
}
