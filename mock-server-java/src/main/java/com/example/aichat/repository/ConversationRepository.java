package com.example.aichat.repository;

import com.example.aichat.entity.Conversation;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, String> {

    /** 按 updateTime 倒序 */
    List<Conversation> findAllByOrderByUpdateTimeDesc(Pageable pageable);

    @Modifying
    @Query("UPDATE Conversation c SET c.updateTime = :time WHERE c.id = :id")
    void touchUpdateTime(@Param("id") String id, @Param("time") Long time);
}
