package com.example.occupancy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class OccupancyApplication {

	public static void main(String[] args) {
		SpringApplication.run(OccupancyApplication.class, args);
	}

}
