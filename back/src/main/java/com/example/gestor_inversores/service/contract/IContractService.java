package com.example.gestor_inversores.service.contract;

import com.example.gestor_inversores.dto.*;
import java.util.List;

public interface IContractService {

    // 🔹 Crear contrato
    ResponseContractDTO createContract(RequestContractDTO dto);

    // 🔹 Acciones del estudiante (un endpoint para cada acción)
    ResponseContractDTO signContract(Long contractId, RequestContractActionByStudentDTO dto);

    ResponseContractDTO closeContract(Long contractId, RequestContractActionByStudentDTO dto);

    ResponseContractDTO cancelContract(Long contractId, RequestContractActionByStudentDTO dto);

    ResponseContractDTO refundContract(Long contractId, RequestContractActionByStudentDTO dto);

    // 🔹 Acciones del inversor
    ResponseContractDTO updateContractByInvestor(Long contractId, RequestContractUpdateByInvestorDTO dto);

    ResponseContractDTO cancelByInvestor(Long contractId, RequestContractActionByInvestorDTO dto);
    // 🔹 Consultas
    List<ResponseContractDTO> getContractsByProject(Long projectId);

    List<ResponseContractDTO> getContractsByInvestor(Long investorId);

    List<ResponseContractDTO> getContractsByOwner(Long ownerId);
    List<ResponseContractDTO> getContractsByInvestorAndProject(Long investorId, Long projectId);
}
