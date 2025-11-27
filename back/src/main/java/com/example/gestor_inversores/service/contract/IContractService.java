package com.example.gestor_inversores.service.contract;

import com.example.gestor_inversores.dto.*;

import java.util.List;
import java.util.Map;

public interface IContractService {

    ResponseContractDTO createContract(RequestContractDTO dto);

    ResponseContractDTO updateContractByInvestor(Long contractId, RequestContractUpdateByInvestorDTO dto);

    ResponseContractDTO updateContractByStudent(Long contractId, RequestContractUpdateByStudentDTO dto);

    ResponseContractDTO agreeByStudent(Long contractId, RequestContractActionByStudentDTO dto);

    ResponseContractDTO agreeByInvestor(Long contractId, RequestContractActionByInvestorDTO dto);

    ResponseContractDTO signByStudent(Long contractId, RequestContractActionByStudentDTO dto);

    ResponseContractDTO signByInvestor(Long contractId, RequestContractActionByInvestorDTO dto);

    ResponseContractDTO closeContract(Long contractId, RequestContractActionByStudentDTO dto);

    ResponseContractDTO cancelContract(Long contractId, RequestContractActionByStudentDTO dto);

    ResponseContractDTO refundContract(Long contractId, RequestContractActionByStudentDTO dto);

    ResponseContractDTO cancelByInvestor(Long contractId, RequestContractActionByInvestorDTO dto);

    List<ResponseContractDTO> getContractsByProject(Long projectId);

    List<ResponseContractDTO> getContractsByInvestor(Long investorId);

    List<ResponseContractDTO> getContractsByOwner(Long ownerId);

    List<ResponseContractDTO> getContractsByInvestorAndProject(Long investorId, Long projectId);

    Map<String, Boolean> checkContractExists(Long projectId, String contractName);
}
