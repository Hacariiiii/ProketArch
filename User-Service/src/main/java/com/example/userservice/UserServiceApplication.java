package com.example.userservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.userservice.repository.RoleRepository;
import com.example.userservice.entity.Role;

@SpringBootApplication
@EnableDiscoveryClient
public class UserServiceApplication {

	@Autowired
	private RoleRepository roleRepository;

	public static void main(String[] args) {
		SpringApplication.run(UserServiceApplication.class, args);
	}

	// ✅ Initialize default roles after the application starts
	@PostConstruct
	public void initializeRoles() {
		if (roleRepository.findByName("USER").isEmpty()) {
			Role userRole = new Role("USER");
			roleRepository.save(userRole);
		}
		if (roleRepository.findByName("ADMIN").isEmpty()) {
			Role adminRole = new Role("ADMIN");
			roleRepository.save(adminRole);
		}
	}
}
