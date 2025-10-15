package com.example.gestor_inversores.service.investor;

import com.example.gestor_inversores.dto.RequestInvestorDTO;
import com.example.gestor_inversores.dto.RequestInvestorUpdateByAdminDTO;
import com.example.gestor_inversores.dto.RequestInvestorUpdateDTO;
import com.example.gestor_inversores.dto.ResponseInvestorDTO;

import java.util.List;

public interface IInvestorService {
    ResponseInvestorDTO save(RequestInvestorDTO dto);

    ResponseInvestorDTO findById(Long id);

    List<ResponseInvestorDTO> findAll();

    ResponseInvestorDTO patchInvestor(Long id, RequestInvestorUpdateDTO patchDto);

    ResponseInvestorDTO activateInvestor(Long id);

    ResponseInvestorDTO desactivateInvestor(Long id);

    ResponseInvestorDTO updateByAdmin(Long id, RequestInvestorUpdateByAdminDTO dto);
}
