package com.example.gestor_inversores.service.investor;

import com.example.gestor_inversores.dto.RequestInvestorDTO;
import com.example.gestor_inversores.dto.RequestInvestorUpdateDTO;
import com.example.gestor_inversores.dto.ResponseInvestorDTO;

import java.util.List;

public interface IInvestorService {

    List<ResponseInvestorDTO> findAll();

    ResponseInvestorDTO findById(Long id);

    ResponseInvestorDTO save(RequestInvestorDTO investor);

    ResponseInvestorDTO patchInvestor(Long id, RequestInvestorUpdateDTO patchDto);

    ResponseInvestorDTO activateInvestor(Long id);

    ResponseInvestorDTO desactivateInvestor(Long id);

}
