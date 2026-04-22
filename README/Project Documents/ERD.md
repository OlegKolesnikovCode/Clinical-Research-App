Relationship summary
Core relationships
Study 1 → many Sites
Study 1 → many Participants
Study 1 → many VisitTemplates
Site 1 → many Participants
Participant 1 → many ParticipantVisits
Study 1 → many Documents (optional layer)
Study 1 → many Tasks (optional layer)
Important integrity rules
Participant is unique by:
studyId + subjectIdentifier
Site.studyId must match the participant’s studyId
ParticipantVisit is generated from study templates during enrollment
delete behavior for integrity-critical parent-child relationships uses:
onDelete: Restrict
Compact text version
Study
 ├──< Site
 ├──< Participant
 │     └──< ParticipantVisit
 ├──< VisitTemplate
 ├──< Document
 └──< Task