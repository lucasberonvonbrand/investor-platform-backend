package com.example.gestor_inversores.mapper;

import com.example.gestor_inversores.dto.AddressDTO;
import com.example.gestor_inversores.model.Address;
import com.example.gestor_inversores.model.enums.Province;
import org.springframework.stereotype.Component;

@Component
public class AddressMapper {

    public Address toEntity(AddressDTO dto) {
        if (dto == null) {
            return null;
        }
        Address address = new Address();
        address.setStreet(dto.getStreet());
        address.setNumber(dto.getNumber());
        address.setCity(dto.getCity());
        if (dto.getProvince() != null) {
            try {
                address.setProvince(Province.valueOf(dto.getProvince().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Manejar el caso donde el string no es una provincia válida, si es necesario
                address.setProvince(null);
            }
        }
        address.setPostalCode(dto.getPostalCode());
        return address;
    }

    public AddressDTO fromEntity(Address address) {
        if (address == null) {
            return null;
        }
        AddressDTO dto = new AddressDTO();
        dto.setStreet(address.getStreet());
        dto.setNumber(address.getNumber());
        dto.setCity(address.getCity());
        dto.setProvince(address.getProvince() != null ? address.getProvince().name() : null);
        dto.setPostalCode(address.getPostalCode());
        return dto;
    }
}
