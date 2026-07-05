<?php
// Shared helpers for the FAQ accordion. Records (data/faq.json) are text-only:
// { id, question, answer, order }. Seeded on first read from a starter set.
// Not a routable endpoint.
require_once __DIR__ . '/../_shared.php';

function faq_store(): string
{
    return GC_DATA_DIR . '/faq.json';
}

function faq_seed(): array
{
    $defaults = [
        [
            'question' => 'What services does Genesis Kreations offer?',
            'answer'   => 'We provide media production, photography, videography, live streaming, digital marketing, studio rental, corporate training, and a professional media academy offering industry-focused courses.',
        ],
        [
            'question' => 'Who can enroll in the Media Academy?',
            'answer'   => 'Our courses are open to students, graduates, working professionals, entrepreneurs, and anyone passionate about building a career in media and content creation.',
        ],
        [
            'question' => 'Do I need prior experience to join a course?',
            'answer'   => 'No. We offer beginner-friendly programs as well as advanced training for learners who want to enhance their professional skills.',
        ],
        [
            'question' => 'Will I receive a certificate after completing a course?',
            'answer'   => 'Yes. Participants receive a course completion certificate upon successfully fulfilling the program requirements.',
        ],
        [
            'question' => 'Are the classes practical or theory-based?',
            'answer'   => 'Our training emphasizes hands-on learning through live projects, professional equipment, and real-world assignments, supported by essential theoretical concepts.',
        ],
        [
            'question' => 'Do you provide corporate media services?',
            'answer'   => 'Yes. We work with businesses, brands, educational institutions, and organizations to produce commercials, corporate films, promotional videos, event coverage, and digital content.',
        ],
        [
            'question' => 'Can I rent your studio?',
            'answer'   => 'Yes. Our studio facilities are available for professional shoots, interviews, podcasts, product photography, video production, and other creative projects, subject to availability.',
        ],
        [
            'question' => 'Do you offer customized training programs?',
            'answer'   => 'Yes. We design customized workshops and corporate training programs based on the learning objectives and requirements of organizations and institutions.',
        ],
        [
            'question' => 'How can I request a quotation for a project?',
            'answer'   => 'Contact us through our website, email, or phone with your project details, and our team will provide a customized quotation.',
        ],
        [
            'question' => 'How can I contact Genesis Kreations?',
            'answer'   => 'You can reach us through the Contact Us page, by phone, email, or by visiting our office. Our team will be happy to assist you.',
        ],
    ];

    $records = [];
    $order = 0;
    foreach ($defaults as $d) {
        $records[] = [
            'id'        => bin2hex(random_bytes(6)),
            'question'  => $d['question'],
            'answer'    => $d['answer'],
            'order'     => $order++,
            'createdAt' => date('c'),
            'updatedAt' => date('c'),
        ];
    }
    json_save(faq_store(), $records);
    return $records;
}

function faq_load(): array
{
    $store = faq_store();
    if (!is_file($store)) {
        return faq_seed();
    }
    $data = json_load($store, []);
    return is_array($data) ? $data : [];
}

function faq_sorted(array $list): array
{
    usort($list, static function ($a, $b) {
        return ((int) ($a['order'] ?? 0)) <=> ((int) ($b['order'] ?? 0));
    });
    return $list;
}
