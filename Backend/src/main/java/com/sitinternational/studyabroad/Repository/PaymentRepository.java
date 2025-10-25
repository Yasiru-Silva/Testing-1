package com.sitinternational.studyabroad.Repository;

import com.sitinternational.studyabroad.entity.Payment;
import com.sitinternational.studyabroad.entity.Application;
import com.sitinternational.studyabroad.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByApplication(Application application);

    List<Payment> findByStatus(PaymentStatus status);
}
