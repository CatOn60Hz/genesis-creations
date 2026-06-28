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
            'question' => 'Do I need any prior experience?',
            'answer'   => 'No. Our courses are built to take you from scratch — no prior knowledge or equipment is required. We teach the fundamentals first, then build up to professional, hands-on work.',
        ],
        [
            'question' => 'How long are the courses?',
            'answer'   => 'Most certification courses run for 1 month (Mon to Fri, about 3 hours a day). The Diploma in Visual Communication is a 1-year program, and some workshops run over a few focused days.',
        ],
        [
            'question' => 'Will I get a certificate?',
            'answer'   => 'Yes. Every course ends with an industry-recognized certificate from Genesis Kreations that carries real weight with studios, agencies, and clients.',
        ],
        [
            'question' => 'Where are the classes held?',
            'answer'   => 'At the Genesis Kreations Media Academy studio in Chennai, with a mix of hands-on studio sessions and real outdoor/location shoots.',
        ],
        [
            'question' => 'Do you help with jobs or freelancing?',
            'answer'   => 'We provide portfolio-building support, mentorship from working industry professionals, and guidance for both job-readiness and freelance work.',
        ],
        [
            'question' => 'How do I enroll?',
            'answer'   => 'Reach out through the Contact page or give us a call. We will walk you through the schedule, fees, and the next available batch.',
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
