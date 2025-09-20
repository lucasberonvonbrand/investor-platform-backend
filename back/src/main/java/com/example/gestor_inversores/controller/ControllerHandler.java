package com.example.gestor_inversores.controller;

import com.example.gestor_inversores.exception.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.time.LocalDateTime;
import java.util.List;

@RestControllerAdvice
public class ControllerHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(value = {ExistingProjectException.class})
    public ResponseEntity<ApiError> handleExistingProjectException(ExistingProjectException ex) {
        HttpStatus httpStatus = HttpStatus.CONFLICT;
        ApiError apiError = new ApiError("Error: " + ex.getMessage(), httpStatus, LocalDateTime.now());
        return new ResponseEntity<>(apiError, httpStatus);
    }

    @ExceptionHandler(value = {CreateException.class})
    public ResponseEntity<ApiError> handleCreateException(CreateException ex) {
        HttpStatus httpStatus = HttpStatus.BAD_REQUEST;
        ApiError apiError = new ApiError("Error: " + ex.getMessage(), httpStatus, LocalDateTime.now());
        return new ResponseEntity<>(apiError, httpStatus);
    }

    @ExceptionHandler(value = {ProjectNotFoundException.class})
    public ResponseEntity<ApiError> handleProjectNotFoundException(ProjectNotFoundException ex) {
        HttpStatus httpStatus = HttpStatus.NOT_FOUND;
        ApiError apiError = new ApiError("Error: " + ex.getMessage(), httpStatus, LocalDateTime.now());
        return new ResponseEntity<>(apiError, httpStatus);
    }

    @ExceptionHandler(value = {UpdateException.class})
    public ResponseEntity<ApiError> handleUpdateException(UpdateException ex) {
        HttpStatus httpStatus = HttpStatus.BAD_REQUEST;
        ApiError apiError = new ApiError("Error: " + ex.getMessage(), httpStatus, LocalDateTime.now());
        return new ResponseEntity<>(apiError, httpStatus);
    }

    @Override
    public ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {

        BindingResult bindingResult = ex.getBindingResult();
        List<ObjectError> errorList = bindingResult.getAllErrors();
        StringBuilder errorMessage = new StringBuilder();

        HttpStatus httpStatus = HttpStatus.resolve(status.value());

        for (ObjectError objectError : errorList) {
            if (objectError instanceof FieldError fieldError) {
                errorMessage.append(fieldError.getField())
                        .append(": ")
                        .append(fieldError.getDefaultMessage())
                        .append(". ");
            } else {
                errorMessage.append(objectError.getDefaultMessage()).append(". ");
            }
        }

        ApiError apiError = new ApiError(
                errorMessage.toString(),
                httpStatus,
                LocalDateTime.now()
        );

        return new ResponseEntity<>(apiError, httpStatus);
    }

}
