package com.example.gestor_inversores.service.auth;

import com.example.gestor_inversores.dto.PasswordResetRequestDTO;
import com.example.gestor_inversores.dto.PasswordResetRequestEmailDTO;

public interface IPasswordResetService {

    void createPasswordResetToken(PasswordResetRequestEmailDTO dto);
    void resetPassword(PasswordResetRequestDTO dto);

}
