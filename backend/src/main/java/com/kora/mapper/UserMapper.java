package com.kora.mapper;

import com.kora.dto.response.UserResponse;
import com.kora.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toResponse(User user);
}