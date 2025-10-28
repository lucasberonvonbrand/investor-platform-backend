package com.example.gestor_inversores.model.enums;

public enum EarningStatus {

    IN_PROGRESS,          // Ganancia generada, pendiente de envío por parte del estudiante
    PENDING_CONFIRMATION, // El estudiante ha confirmado el envío, pendiente de recepción del inversor
    RECEIVED,             // El inversor ha confirmado la recepción del dinero
    NOT_RECEIVED          // El inversor ha reportado que no recibió el dinero
}
