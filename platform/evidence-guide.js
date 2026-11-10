/* Generic, educational notes about study designs. These describe design types in general.
 * They are NOT assessments of any specific paper and carry no scores. */
(function () {
  'use strict';
  var N = {
    sr: { name: 'Systematic review / meta-analysis', what: 'Uses a defined search and selection method to identify studies; a meta-analysis statistically pools compatible results.',
      limits: ['Only as reliable as the studies it includes.', 'Differences in populations, interventions and outcome definitions (heterogeneity) can make pooling misleading.', 'Publication bias and selective reporting can skew what is available to pool.', 'Search and inclusion choices can change conclusions. The “systematic review” label alone does not guarantee a rigorous review.'] },
    rct: { name: 'Randomized controlled trial', what: 'Participants are randomly allocated to interventions, which on average balances known and unknown confounders.',
      limits: ['Often small, short or in selected populations, which limits generalizability.', 'Blinding may be impossible for some interventions.', 'Dropout, protocol deviations and outcome switching can bias results.', 'Surrogate or composite outcomes may not reflect outcomes that matter to patients.', 'A single trial rarely settles a question.'] },
    ct: { name: 'Clinical trial (randomization not stated)', what: 'A prospective study of an intervention. The source type does not say whether allocation was random.',
      limits: ['Without randomization, confounding and selection bias are more likely.', 'Check the full text for allocation method, comparator and blinding.'] },
    obs: { name: 'Observational study', what: 'Cohort, case-control and cross-sectional studies observe exposures and outcomes without assigning them.',
      limits: ['Confounding and selection bias are common.', 'Association does not establish causation.', 'Exposure and outcome measurement can be inaccurate.', 'Cross-sectional designs cannot show which came first.'] },
    case: { name: 'Case report / series', what: 'Describes one or a few patients.', limits: ['No comparison group, so it cannot estimate how common something is or whether a treatment works.', 'Useful for generating hypotheses and describing rare events.'] },
    review: { name: 'Review (narrative or unspecified)', what: 'A summary of literature that may not follow a systematic method.', limits: ['Study selection may be subjective.', 'May reflect the authors’ perspective. Check the date and methods.'] },
    preclin: { name: 'Animal, laboratory or preclinical study', what: 'Studies in cells, tissues or animals that probe mechanisms and early safety.', limits: ['Findings often do not translate to humans.', 'Doses, species and conditions can differ greatly from clinical use.', 'Not evidence of benefit or safety in patients.'] },
    guideline: { name: 'Clinical guideline', what: 'Recommendations issued by a professional body or agency, usually graded against evidence.', limits: ['May be out of date. Check the issue date and any later updates.', 'Recommendations can differ by country, setting and resources.', 'Check the issuing body and its conflict-of-interest policy.'] },
    nonres: { name: 'Editorial, letter or comment', what: 'Opinion or commentary rather than original data.', limits: ['Does not report new primary data.', 'Reflects the author’s view.'] },
    unk: { name: 'Design not stated', what: 'The source does not list a study type and the abstract gives no clear design wording.', limits: ['Read the full paper to determine the design before relying on it.'] }
  };
  var CHECK = {
    rct: ['Was allocation random, and was the allocation sequence concealed?', 'Were participants and outcome assessors blinded where this was possible?', 'Were all randomized participants accounted for in the analysis (dropout, crossover)?', 'Was the primary outcome pre-specified (for example, registered before the trial started)?', 'Is the primary outcome clinically meaningful, not only a surrogate marker?', 'Is the study population similar to the patients or population you care about?', 'Are funding and conflicts of interest disclosed?'],
    obs: ['Is the comparison group appropriate and drawn from the same population?', 'Were exposures and outcomes measured reliably and in the same way for everyone?', 'Did the authors adjust for the main confounders you can think of?', 'Could the relationship run the other way (reverse causation)?', 'Was follow-up long enough, with limited loss to follow-up?', 'Is the population similar to the one you care about?', 'Are funding and conflicts of interest disclosed?'],
    sr: ['Was the review question clearly defined, and was a protocol registered?', 'Was the search comprehensive (several databases, no unexplained restrictions)?', 'Were study selection and data extraction done in a reproducible way (for example by two reviewers)?', 'Was the risk of bias of the included studies assessed and taken into account?', 'Were the studies similar enough to pool, and was heterogeneity explored?', 'Was publication bias considered?', 'Are funding and conflicts of interest disclosed?']
  };
  var SECTION_ROLES = [
    ['question', /objective|aim|purpose|question|background|introduction/i], ['methods', /method|design|setting|participants?|population|patients?|subjects|intervention/i],
    ['results', /result|finding|outcome/i], ['conclusions', /conclusion|interpretation|implication/i], ['limitations', /limitation/i]
  ];
  function role(label) { for (var i = 0; i < SECTION_ROLES.length; i++) if (SECTION_ROLES[i][1].test(label || '')) return SECTION_ROLES[i][0]; return null; }
  window.KVEvidence = { NOTES: N, CHECKLISTS: CHECK, role: role };
})();
