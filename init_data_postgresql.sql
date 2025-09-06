-- HandyConnect PostgreSQL Database Initialization
-- Données compatibles avec les routes frontend et backend

-- Insert sample users
INSERT INTO users (id, email, first_name, last_name, role, city) VALUES
('worker_1', 'adam.sirri@email.com', 'Adam', 'Sirri', 'worker', 'Casablanca'),
('worker_2', 'fatima.alami@email.com', 'Fatima', 'Alami', 'worker', 'Rabat'),
('worker_3', 'mohamed.bennani@email.com', 'Mohamed', 'Bennani', 'worker', 'Marrakech'),
('worker_4', 'aicha.zahra@email.com', 'Aicha', 'Zahra', 'worker', 'Fès'),
('worker_5', 'youssef.idrissi@email.com', 'Youssef', 'Idrissi', 'worker', 'Tanger'),
('worker_6', 'laila.hassani@email.com', 'Laila', 'Hassani', 'worker', 'Casablanca'),
('worker_7', 'omar.benali@email.com', 'Omar', 'Benali', 'worker', 'Rabat'),
('worker_8', 'zineb.radi@email.com', 'Zineb', 'Radi', 'worker', 'Marrakech'),
('client_1', 'sara.hassan@email.com', 'Sara', 'Hassan', 'client', 'Casablanca'),
('admin_1', 'admin@handyconnect.ma', 'Admin', 'HandyConnect', 'admin', 'Casablanca')
ON CONFLICT (id) DO NOTHING;

-- Insert worker profiles
INSERT INTO worker_profiles (user_id, category, specializations, experience, skills, description, hourly_rate, rating, total_reviews, phone_number) VALUES
('worker_1', 'plumbing', ARRAY['plomberie', 'réparation fuites', 'installation sanitaire'], 8, ARRAY['Réparation fuites', 'Installation sanitaire', 'Débouchage', 'Plomberie générale'], 'Plombier expérimenté avec 8 ans d''expérience. Spécialiste en réparation et installation sanitaire. Interventions rapides et garanties.', 120.00, 4.8, 156, '+212661234567'),

('worker_2', 'electricity', ARRAY['électricité', 'installation électrique', 'réparation'], 6, ARRAY['Installation électrique', 'Réparation circuits', 'Mise aux normes', 'Dépannage électrique'], 'Électricienne qualifiée avec 6 ans d''expérience. Interventions rapides et sécurisées. Spécialiste en installations résidentielles.', 110.00, 4.7, 89, '+212662345678'),

('worker_3', 'painting', ARRAY['peinture', 'décoration', 'rénovation'], 12, ARRAY['Peinture intérieure', 'Peinture extérieure', 'Décoration murale', 'Enduits'], 'Peintre professionnel avec plus de 12 ans d''expérience. Spécialiste en peinture décorative et rénovation. Travail soigné garanti.', 90.00, 4.9, 203, '+212663456789'),

('worker_4', 'gardening', ARRAY['jardinage', 'entretien espaces verts', 'plantation'], 5, ARRAY['Entretien jardin', 'Taille arbres', 'Plantation', 'Arrosage automatique'], 'Jardinière passionnée avec 5 ans d''expérience. Spécialiste de l''entretien d''espaces verts et création de jardins.', 80.00, 4.6, 67, '+212664567890'),

('worker_5', 'cleaning', ARRAY['nettoyage', 'entretien ménager', 'désinfection'], 3, ARRAY['Nettoyage résidentiel', 'Nettoyage bureau', 'Désinfection', 'Entretien régulier'], 'Service de nettoyage professionnel et fiable. 3 ans d''expérience. Produits écologiques disponibles.', 70.00, 4.5, 45, '+212665678901'),

('worker_6', 'carpentry', ARRAY['menuiserie', 'ébénisterie', 'réparation meubles'], 10, ARRAY['Menuiserie sur mesure', 'Réparation meubles', 'Installation placards', 'Ébénisterie'], 'Menuisier expérimenté, 10 ans dans le métier. Spécialiste en menuiserie sur mesure et réparation de meubles anciens.', 100.00, 4.7, 134, '+212666789012'),

('worker_7', 'renovation', ARRAY['rénovation', 'maçonnerie', 'carrelage'], 15, ARRAY['Rénovation complète', 'Maçonnerie', 'Carrelage', 'Isolation'], 'Expert en rénovation avec 15 ans d''expérience. Spécialiste en rénovation complète d''appartements et maisons.', 130.00, 4.8, 178, '+212667890123'),

('worker_8', 'hvac', ARRAY['climatisation', 'chauffage', 'ventilation'], 7, ARRAY['Installation climatisation', 'Réparation chauffage', 'Ventilation', 'Maintenance'], 'Technicien HVAC certifié. 7 ans d''expérience en installation et maintenance de systèmes de climatisation et chauffage.', 115.00, 4.6, 92, '+212668901234')
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample interventions
INSERT INTO interventions (client_id, worker_id, title, description, category, urgency, address, city, status, max_budget) VALUES
('client_1', 'worker_1', 'Réparation fuite cuisine', 'Fuite importante sous l''évier de la cuisine. L''eau s''accumule dans le placard inférieur.', 'plumbing', 'high', '123 Avenue Mohammed V, Quartier Maarif', 'Casablanca', 'completed', 800.00),
('client_1', 'worker_2', 'Installation prises électriques', 'Installation de 3 nouvelles prises électriques dans le salon pour équipements électroniques.', 'electricity', 'medium', '123 Avenue Mohammed V, Quartier Maarif', 'Casablanca', 'pending', 600.00),
('client_1', NULL, 'Peinture salon', 'Refaire la peinture du salon (25m²). Préparation des murs incluse.', 'painting', 'low', '123 Avenue Mohammed V, Quartier Maarif', 'Casablanca', 'pending', 1200.00),
('client_1', NULL, 'Entretien jardin', 'Taille des arbres et entretien général du jardin (100m²).', 'gardening', 'medium', '123 Avenue Mohammed V, Quartier Maarif', 'Casablanca', 'pending', 500.00),
('client_1', NULL, 'Nettoyage complet', 'Nettoyage complet de l''appartement après travaux.', 'cleaning', 'low', '123 Avenue Mohammed V, Quartier Maarif', 'Casablanca', 'pending', 400.00);

-- Insert sample reviews
INSERT INTO reviews (intervention_id, client_id, worker_id, rating, comment) VALUES
(1, 'client_1', 'worker_1', 5, 'Excellent travail ! Adam est arrivé à l''heure, a rapidement identifié le problème et l''a réparé efficacement. Très professionnel et le prix était raisonnable. Je recommande vivement !');

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type) VALUES
('client_1', 'Intervention terminée', 'Votre intervention de plomberie a été terminée avec succès.', 'intervention_completed'),
('worker_1', 'Nouvelle évaluation', 'Vous avez reçu une nouvelle évaluation 5 étoiles !', 'review_received'),
('worker_2', 'Nouvelle demande', 'Une nouvelle demande d''intervention correspond à vos compétences.', 'new_request'),
('client_1', 'Paiement confirmé', 'Votre paiement de 450 DH a été confirmé.', 'payment_confirmed'),
('worker_3', 'Profil consulté', 'Votre profil a été consulté 15 fois cette semaine.', 'profile_view');

-- Insert sample messages
INSERT INTO messages (intervention_id, sender_id, receiver_id, content) VALUES
(1, 'client_1', 'worker_1', 'Bonjour Adam, merci pour votre excellent travail sur la réparation de la fuite !'),
(1, 'worker_1', 'client_1', 'Merci beaucoup Sara ! N''hésitez pas à me contacter pour d''autres interventions.'),
(2, 'client_1', 'worker_2', 'Bonjour Fatima, quand pouvez-vous passer pour les prises électriques ?'),
(2, 'worker_2', 'client_1', 'Bonjour ! Je peux passer demain matin vers 9h. Cela vous convient ?');