package com.example.gestor_inversores.mapper;

import com.example.gestor_inversores.dto.AddressDTO;
import com.example.gestor_inversores.dto.RequestInvestorDTO;
import com.example.gestor_inversores.dto.RequestInvestorUpdateDTO;
import com.example.gestor_inversores.dto.ResponseInvestorDTO;
import com.example.gestor_inversores.model.Address;
import com.example.gestor_inversores.model.Investor;
import com.example.gestor_inversores.model.enums.Province;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InvestorMapper {

    private final AddressMapper addressMapper;

    public Investor requestInvestorDTOtoInvestor(RequestInvestorDTO dto) {
        if (dto == null) return null;

        Investor investor = new Investor();

        // ----- Campos de User -----
        investor.setUsername(dto.getUsername());
        investor.setPassword(dto.getPassword()); // se encripta en el Service
        investor.setEmail(dto.getEmail());
        investor.setPhotoUrl(dto.getPhotoUrl());

        // ----- Campos de Investor -----
        investor.setCuit(dto.getCuit());
        investor.setContactPerson(dto.getContactPerson());
        investor.setPhone(dto.getPhone());
        investor.setWebSite(dto.getWebSite());

        // ----- Address -----
        if (dto.getAddress() != null) {
            investor.setAddress(addressMapper.toEntity(dto.getAddress()));
        }

        /**
         * Roles (se asignan en el Service, no aquí)
         * investor.setRolesList(new HashSet<>());
         */

        return investor;
    }

    public ResponseInvestorDTO investorToResponseInvestorDTO(Investor investor) {
        if (investor == null) return null;

        ResponseInvestorDTO dto = new ResponseInvestorDTO();

        // ----- Campos de User -----
        dto.setId(investor.getId());
        dto.setUsername(investor.getUsername());
        dto.setEmail(investor.getEmail());
        dto.setPhotoUrl(investor.getPhotoUrl());

        // ----- Campos de seguridad -----
        dto.setEnabled(investor.getEnabled());
        dto.setAccountNotExpired(investor.getAccountNotExpired());
        dto.setAccountNotLocked(investor.getAccountNotLocked());
        dto.setCredentialNotExpired(investor.getCredentialNotExpired());

        // ----- Campos de Investor -----
        dto.setCuit(investor.getCuit());
        dto.setContactPerson(investor.getContactPerson());
        dto.setPhone(investor.getPhone());
        dto.setWebSite(investor.getWebSite());

        // ----- Address -----
        if (investor.getAddress() != null) {
            dto.setAddress(addressMapper.fromEntity(investor.getAddress()));
        }

        return dto;
    }

    public void patchInvestorFromDto(RequestInvestorUpdateDTO dto, Investor investor) {
        if (dto.getUsername() != null && !dto.getUsername().isBlank()) {
            investor.setUsername(dto.getUsername());
        }
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            investor.setEmail(dto.getEmail());
        }
        if (dto.getPhotoUrl() != null) {
            investor.setPhotoUrl(dto.getPhotoUrl());
        }
        if (dto.getPhone() != null && !dto.getPhone().isBlank()) {
            investor.setPhone(dto.getPhone());
        }
        if (dto.getWebSite() != null) {
            investor.setWebSite(dto.getWebSite());
        }
        // Dirección
        if (dto.getAddress() != null) {
            AddressDTO addressDTO = dto.getAddress();
            Address address = investor.getAddress();

            if (address == null) {
                address = addressMapper.toEntity(addressDTO);
                investor.setAddress(address);
            } else {
                // NOTA: Esta lógica de parcheo manual podría moverse al AddressMapper en el futuro
                if (addressDTO.getStreet() != null) address.setStreet(addressDTO.getStreet());
                if (addressDTO.getNumber() > 0) address.setNumber(addressDTO.getNumber());
                if (addressDTO.getCity() != null) address.setCity(addressDTO.getCity());
                if (addressDTO.getProvince() != null) {
                    try {
                        address.setProvince(Province.valueOf(addressDTO.getProvince().toUpperCase()));
                    } catch (IllegalArgumentException e) {
                        // Ignorar provincia inválida en un parcheo
                    }
                }
                if (addressDTO.getPostalCode() > 0) address.setPostalCode(addressDTO.getPostalCode());
            }
        }
    }
}
